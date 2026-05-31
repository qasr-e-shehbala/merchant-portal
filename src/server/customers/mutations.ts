import { prisma } from "@/server/db/client";
import { normalizePhone } from "@/lib/utils";

interface UpsertCustomerInput {
  phone: string;
  name?: string;
  city?: string;
}

export async function upsertCustomerByPhone({ phone, name, city }: UpsertCustomerInput) {
  const normalized = normalizePhone(phone);
  return prisma.customer.upsert({
    where: { phone: normalized },
    update: {
      ...(name ? { name } : {}),
      ...(city ? { city } : {}),
    },
    create: { phone: normalized, name, city },
  });
}
