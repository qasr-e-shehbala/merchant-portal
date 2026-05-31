import type { LeadSource } from "@prisma/client";
import { prisma } from "@/server/db/client";
import { generateRef, normalizePhone } from "@/lib/utils";
import { upsertCustomerByPhone } from "@/server/customers/mutations";

export interface CreateLeadInput {
  name?: string;
  phone: string;
  city?: string;
  source: LeadSource;
  productId?: string;
  sizeNote?: string;
  pageUrl?: string;
  utmSource?: string;
  utmCampaign?: string;
}

export async function createLead(input: CreateLeadInput) {
  const customer = await upsertCustomerByPhone({
    phone: input.phone,
    name: input.name,
    city: input.city,
  });

  return prisma.lead.create({
    data: {
      ref: generateRef(),
      phone: normalizePhone(input.phone),
      customerId: customer.id,
      city: input.city,
      source: input.source,
      productId: input.productId,
      sizeNote: input.sizeNote,
      pageUrl: input.pageUrl,
      utmSource: input.utmSource,
      utmCampaign: input.utmCampaign,
    },
  });
}
