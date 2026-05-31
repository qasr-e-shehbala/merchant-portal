import { prisma } from "@/server/db/client";
import { safeQuery } from "@/server/db/safe-query";

export interface AdminCategoryRow {
  id: string;
  slug: string;
  name: string;
  parentName: string | null;
  productCount: number;
  introCopy: string | null;
}

export async function listAdminCategories(): Promise<AdminCategoryRow[]> {
  return safeQuery(async () => {
    const records = await prisma.category.findMany({
      include: {
        parent: { select: { name: true } },
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    });
    return records.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      parentName: cat.parent?.name ?? null,
      productCount: cat._count.products,
      introCopy: cat.introCopy,
    }));
  }, []);
}

export async function getAdminCategory(id: string) {
  return safeQuery(
    () => prisma.category.findUnique({ where: { id } }),
    null
  );
}
