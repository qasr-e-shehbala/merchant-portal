import { prisma } from "@/server/db/client";
import { safeQuery } from "@/server/db/safe-query";

export interface StockRow {
  variantId: string;
  sku: string;
  productName: string;
  attributes: Record<string, string>;
  onHand: number;
  reserved: number;
  available: number;
  lowStockThreshold: number;
  isLow: boolean;
}

export async function listStockLevels(branchId?: string): Promise<StockRow[]> {
  return safeQuery(async () => {
    const branch = branchId
      ? { id: branchId }
      : await prisma.branch.findFirst({ where: { isActive: true } });
    if (!branch) return [];

    const records = await prisma.stockLevel.findMany({
      where: { branchId: branch.id },
      include: {
        variant: { include: { product: { select: { name: true } } } },
      },
      orderBy: { variant: { product: { name: "asc" } } },
    });

    return records.map((level) => {
      const available = level.onHand - level.reserved;
      return {
        variantId: level.variantId,
        sku: level.variant.sku,
        productName: level.variant.product.name,
        attributes: (level.variant.attributes as Record<string, string>) ?? {},
        onHand: level.onHand,
        reserved: level.reserved,
        available,
        lowStockThreshold: level.lowStockThreshold,
        isLow: available <= level.lowStockThreshold,
      };
    });
  }, []);
}

export interface FabricRow {
  id: string;
  code: string;
  name: string;
  composition: string | null;
  color: string | null;
  onHandMeters: string | null;
}

export async function listFabrics(): Promise<FabricRow[]> {
  return safeQuery(async () => {
    const records = await prisma.fabric.findMany({ orderBy: { name: "asc" } });
    return records.map((f) => ({
      id: f.id,
      code: f.code,
      name: f.name,
      composition: f.composition,
      color: f.color,
      onHandMeters: f.onHandMeters?.toString() ?? null,
    }));
  }, []);
}
