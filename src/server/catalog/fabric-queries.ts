import { prisma } from "@/server/db/client";
import { safeQuery } from "@/server/db/safe-query";

export interface AdminFabricRow {
  id: string;
  code: string;
  name: string;
  composition: string | null;
  color: string | null;
  costPerMeterMinor: string | null;
  supplierNote: string | null;
  productCount: number;
}

export async function listAdminFabrics(): Promise<AdminFabricRow[]> {
  return safeQuery(async () => {
    const records = await prisma.fabric.findMany({
      include: { _count: { select: { fabricOptions: true } } },
      orderBy: { name: "asc" },
    });
    return records.map((f) => ({
      id: f.id,
      code: f.code,
      name: f.name,
      composition: f.composition,
      color: f.color,
      costPerMeterMinor: f.costPerMeterMinor?.toString() ?? null,
      supplierNote: f.supplierNote,
      productCount: f._count.fabricOptions,
    }));
  }, []);
}

export async function getAdminFabric(id: string) {
  return safeQuery(
    () => prisma.fabric.findUnique({ where: { id } }),
    null
  );
}
