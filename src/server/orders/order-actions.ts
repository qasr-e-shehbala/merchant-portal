"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { PaymentMethod } from "@prisma/client";
import { prisma } from "@/server/db/client";
import { requireStaff } from "@/server/auth/current-user";
import { upsertCustomerByPhone } from "@/server/customers/mutations";
import { generateRef, rupeesToPaisa } from "@/lib/utils";

export interface OrderFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

const itemSchema = z.object({
  productName: z.string().trim().min(1),
  qty: z.coerce.number().int().min(1).max(99),
  unitPriceRupees: z.coerce.number().min(0),
  fabricNote: z.string().trim().optional(),
});

const formSchema = z.object({
  name: z.string().trim().min(2, "Customer name is required"),
  phone: z.string().trim().min(7, "A valid phone number is required"),
  city: z.string().trim().optional(),
  discountRupees: z.coerce.number().min(0).optional(),
  depositRupees: z.coerce.number().min(0).optional(),
  paymentMethod: z.string().optional(),
  fullPayment: z.string().optional(),
  notes: z.string().trim().optional(),
  items: z.string().min(1),
});

const VALID_METHODS = new Set(["CASH", "RAAST", "BANK_TRANSFER", "JAZZCASH", "EASYPAISA", "CARD"]);

export async function createWalkInOrderAction(
  _prev: OrderFormState,
  formData: FormData
): Promise<OrderFormState> {
  const staff = await requireStaff();

  const parsed = formSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  let rawItems: unknown;
  try {
    rawItems = JSON.parse(data.items);
  } catch {
    return { error: "Could not read the item list." };
  }
  const itemsResult = z.array(itemSchema).min(1).safeParse(rawItems);
  if (!itemsResult.success) {
    return { error: "Add at least one item with a name, quantity and price." };
  }
  const items = itemsResult.data;

  const subtotalMinor = items.reduce(
    (sum, item) => sum + rupeesToPaisa(item.unitPriceRupees) * BigInt(item.qty),
    0n
  );
  const discountMinor = data.discountRupees ? rupeesToPaisa(data.discountRupees) : 0n;
  const totalMinor = subtotalMinor > discountMinor ? subtotalMinor - discountMinor : 0n;
  const requestedDeposit =
    data.fullPayment === "on" ? totalMinor : data.depositRupees ? rupeesToPaisa(data.depositRupees) : 0n;
  const paidMinor = requestedDeposit > totalMinor ? totalMinor : requestedDeposit;
  const method = (
    data.paymentMethod && VALID_METHODS.has(data.paymentMethod) ? data.paymentMethod : "CASH"
  ) as PaymentMethod;

  let orderId: string;
  try {
    const branch = await prisma.branch.findFirst({ where: { isActive: true } });
    if (!branch) return { error: "No active branch is configured. Add a branch first." };

    const customer = await upsertCustomerByPhone({ phone: data.phone, name: data.name, city: data.city });

    orderId = await prisma.$transaction(async (tx) => {
      const paymentStatus = paidMinor === 0n ? "UNPAID" : paidMinor >= totalMinor ? "PAID" : "DEPOSIT_PAID";

      const order = await tx.order.create({
        data: {
          orderRef: generateRef("QES"),
          customerId: customer.id,
          branchId: branch.id,
          channel: "IN_STORE",
          source: "WALK_IN",
          orderStatus: "CONFIRMED",
          paymentStatus,
          fulfillmentType: "IN_STORE_COLLECTION",
          subtotalMinor,
          discountMinor,
          totalMinor,
          depositRequiredMinor: requestedDeposit,
          notes: data.notes,
          items: {
            create: items.map((item) => ({
              productName: item.productName,
              itemKind: "MADE_TO_ORDER",
              qty: item.qty,
              unitPriceMinor: rupeesToPaisa(item.unitPriceRupees),
              lineTotalMinor: rupeesToPaisa(item.unitPriceRupees) * BigInt(item.qty),
              fabricNote: item.fabricNote || null,
            })),
          },
        },
      });

      await tx.orderEvent.create({
        data: {
          orderId: order.id,
          type: "CREATED",
          actorStaffId: staff.staffId,
          note: "Walk-in order created in shop",
        },
      });

      if (paidMinor > 0n) {
        await tx.payment.create({
          data: {
            orderId: order.id,
            type: paidMinor >= totalMinor ? "FULL" : "DEPOSIT",
            method,
            amountMinor: paidMinor,
            status: "VERIFIED",
            collectedAt: new Date(),
            verifiedByStaffId: staff.staffId,
          },
        });
        await tx.orderEvent.create({
          data: { orderId: order.id, type: "PAYMENT_RECORDED", actorStaffId: staff.staffId },
        });
      }

      return order.id;
    });
  } catch {
    return { error: "Could not save the order. Please try again." };
  }

  revalidatePath("/orders");
  revalidatePath("/");
  redirect(`/orders/${orderId}`);
}
