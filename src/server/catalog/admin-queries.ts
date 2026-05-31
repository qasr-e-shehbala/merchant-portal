import { prisma } from "@/server/db/client";
import { safeQuery } from "@/server/db/safe-query";

export interface AdminProductRow {
  id: string;
  slug: string;
  name: string;
  categoryName: string | null;
  productType: string;
  basePriceMinor: string;
  isPublished: boolean;
  imageCount: number;
  updatedAt: string;
}

export async function listAdminProducts(params: {
  query?: string;
  published?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<{ products: AdminProductRow[]; total: number }> {
  const pageSize = params.pageSize ?? 20;
  const page = Math.max(1, params.page ?? 1);

  return safeQuery(async () => {
    const where = {
      ...(params.query
        ? { name: { contains: params.query, mode: "insensitive" as const } }
        : {}),
      ...(params.published !== undefined ? { isPublished: params.published } : {}),
    };

    const [records, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { name: true } },
          _count: { select: { images: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products: records.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        categoryName: p.category?.name ?? null,
        productType: p.productType,
        basePriceMinor: p.basePriceMinor.toString(),
        isPublished: p.isPublished,
        imageCount: p._count.images,
        updatedAt: p.updatedAt.toISOString(),
      })),
      total,
    };
  }, { products: [], total: 0 });
}

export async function getAdminProduct(id: string) {
  return safeQuery(
    () =>
      prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          images: { orderBy: { sortOrder: "asc" } },
          variants: { where: { deletedAt: null } },
          fabricOptions: { include: { fabric: true } },
        },
      }),
    null
  );
}

export async function getCategories() {
  return safeQuery(
    () => prisma.category.findMany({ orderBy: { name: "asc" } }),
    []
  );
}

export async function getAllFabrics() {
  return safeQuery(
    () => prisma.fabric.findMany({ orderBy: { name: "asc" } }),
    []
  );
}
