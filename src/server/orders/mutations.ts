import type { TailoringStage } from "@prisma/client";
import { prisma } from "@/server/db/client";

const TRANSITIONS: Record<TailoringStage, TailoringStage[]> = {
  ENQUIRY: ["MEASURED", "CANCELLED"],
  MEASURED: ["DEPOSIT_PAID", "CANCELLED"],
  DEPOSIT_PAID: ["CUTTING", "CANCELLED"],
  CUTTING: ["STITCHING", "CANCELLED"],
  STITCHING: ["FITTING", "CANCELLED"],
  FITTING: ["REWORK", "FINISHING", "CANCELLED"],
  REWORK: ["FITTING", "CANCELLED"],
  FINISHING: ["READY", "CANCELLED"],
  READY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export async function advanceTailoringStage(jobId: string, nextStage: TailoringStage, staffId?: string) {
  const job = await prisma.tailoringJob.findUnique({ where: { id: jobId } });
  if (!job) throw new Error("Tailoring job not found");

  if (!TRANSITIONS[job.stage].includes(nextStage)) {
    throw new Error(`Illegal transition: ${job.stage} → ${nextStage}`);
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.tailoringJob.update({
      where: { id: jobId },
      data: {
        stage: nextStage,
        reworkCount: nextStage === "REWORK" ? { increment: 1 } : undefined,
        readyAt: nextStage === "READY" ? new Date() : job.readyAt,
      },
    });

    await tx.tailoringEvent.create({
      data: { tailoringJobId: jobId, fromStage: job.stage, toStage: nextStage, staffId },
    });

    return updated;
  });
}

export async function verifyPayment(paymentId: string, staffId: string) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.update({
      where: { id: paymentId },
      data: { status: "VERIFIED", verifiedByStaffId: staffId, collectedAt: new Date() },
    });

    await tx.orderEvent.create({
      data: { orderId: payment.orderId, type: "DEPOSIT_VERIFIED", actorStaffId: staffId },
    });

    const order = await tx.order.findUniqueOrThrow({
      where: { id: payment.orderId },
      include: { payments: true },
    });

    const verifiedTotal = order.payments
      .filter((entry) => entry.status === "VERIFIED")
      .reduce((sum, entry) => sum + entry.amountMinor, 0n);
    const hasVerifiedDeposit = order.payments.some(
      (entry) => entry.type === "DEPOSIT" && entry.status === "VERIFIED"
    );

    const paymentStatus =
      verifiedTotal === 0n
        ? "UNPAID"
        : verifiedTotal >= order.totalMinor
          ? "PAID"
          : hasVerifiedDeposit
            ? "DEPOSIT_PAID"
            : "PARTIALLY_PAID";

    await tx.order.update({ where: { id: payment.orderId }, data: { paymentStatus } });
    return payment;
  });
}
