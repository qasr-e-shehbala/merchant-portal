import { prisma } from "@/server/db/client";
import { safeQuery } from "@/server/db/safe-query";

export interface MeasurementRow {
  id: string;
  customerId: string;
  customerName: string | null;
  customerPhone: string;
  label: string;
  garmentType: string | null;
  isDefault: boolean;
  updatedAt: string;
}

export async function listMeasurements(params: {
  query?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ rows: MeasurementRow[]; total: number }> {
  const pageSize = params.pageSize ?? 20;
  const page = Math.max(1, params.page ?? 1);

  return safeQuery(async () => {
    const [records, total] = await Promise.all([
      prisma.measurementProfile.findMany({
        include: { customer: { select: { name: true, phone: true } } },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.measurementProfile.count(),
    ]);

    return {
      rows: records.map((m) => ({
        id: m.id,
        customerId: m.customerId,
        customerName: m.customer.name,
        customerPhone: m.customer.phone,
        label: m.label,
        garmentType: m.garmentType,
        isDefault: m.isDefault,
        updatedAt: m.updatedAt.toISOString(),
      })),
      total,
    };
  }, { rows: [], total: 0 });
}
