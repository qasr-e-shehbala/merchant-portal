import type { AppointmentType } from "@prisma/client";
import { prisma } from "@/server/db/client";
import { upsertCustomerByPhone } from "@/server/customers/mutations";

const TYPE_MAP: Record<string, AppointmentType> = {
  consultation: "CONSULTATION",
  measurement: "MEASUREMENT",
  fitting: "FITTING",
};

export interface CreateAppointmentInput {
  name: string;
  phone: string;
  city: string;
  appointmentType: keyof typeof TYPE_MAP;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
}

export async function createAppointment(input: CreateAppointmentInput) {
  const branch = await prisma.branch.findFirst({ where: { isActive: true } });
  if (!branch) throw new Error("No active branch configured");

  const customer = await upsertCustomerByPhone({
    phone: input.phone,
    name: input.name,
    city: input.city,
  });

  const scheduledAt = new Date(input.preferredDate);
  const note = [`Preferred time: ${input.preferredTime}`, input.notes].filter(Boolean).join(". ");

  return prisma.appointment.create({
    data: {
      customerId: customer.id,
      branchId: branch.id,
      type: TYPE_MAP[input.appointmentType],
      scheduledAt,
      notes: note,
    },
  });
}
