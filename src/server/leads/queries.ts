import { prisma } from "@/server/db/client";
import { safeQuery } from "@/server/db/safe-query";

export interface LeadRow {
  id: string;
  ref: string;
  phone: string;
  customerName?: string;
  city?: string;
  source: string;
  stage: string;
  productName?: string;
  createdAt: string;
}

export async function getLeads(limit = 100): Promise<LeadRow[]> {
  return safeQuery(async () => {
    const records = await prisma.lead.findMany({
      include: { customer: true, product: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return records.map((lead) => ({
      id: lead.id,
      ref: lead.ref,
      phone: lead.phone,
      customerName: lead.customer?.name ?? undefined,
      city: lead.city ?? lead.customer?.city ?? undefined,
      source: lead.source,
      stage: lead.stage,
      productName: lead.product?.name ?? undefined,
      createdAt: lead.createdAt.toISOString(),
    }));
  }, []);
}
