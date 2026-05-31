import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/client";
import { safeQuery } from "@/server/db/safe-query";
import type { Category, Fabric, FilterState, Product } from "@/types";

const productInclude = {
  category: true,
  images: { orderBy: { sortOrder: "asc" } },
  variants: { where: { deletedAt: null }, include: { stockLevels: true } },
  fabricOptions: { include: { fabric: true } },
} satisfies Prisma.ProductInclude;

type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

function toProduct(record: ProductWithRelations): Product {
  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    description: record.description,
    productType: record.productType,
    basePriceMinor: record.basePriceMinor.toString(),
    isPublished: record.isPublished,
    metaTitle: record.metaTitle,
    metaDescription: record.metaDescription,
    romanUrduKeywords: record.romanUrduKeywords,
    category: record.category
      ? {
          id: record.category.id,
          slug: record.category.slug,
          name: record.category.name,
          parentId: record.category.parentId,
        }
      : null,
    images: record.images.map((image) => ({
      id: image.id,
      r2Key: image.r2Key,
      alt: image.alt,
      sortOrder: image.sortOrder,
    })),
    variants: record.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      attributes: (variant.attributes as Record<string, string>) ?? {},
      priceOverrideMinor: variant.priceOverrideMinor?.toString() ?? null,
      isStockTracked: variant.isStockTracked,
      stockLevels: variant.stockLevels.map((level) => ({
        branchId: level.branchId,
        onHand: level.onHand,
        reserved: level.reserved,
      })),
    })),
    fabricOptions: record.fabricOptions.map((option) => ({
      fabric: {
        id: option.fabric.id,
        code: option.fabric.code,
        name: option.fabric.name,
        composition: option.fabric.composition,
        color: option.fabric.color,
      },
    })),
  };
}

function buildOrderBy(sort?: FilterState["sort"]): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price_asc":
      return { basePriceMinor: "asc" };
    case "price_desc":
      return { basePriceMinor: "desc" };
    default:
      return { createdAt: "desc" };
  }
}

export async function getProducts(filters: FilterState = {}): Promise<Product[]> {
  return safeQuery(async () => {
    const where: Prisma.ProductWhereInput = {
      isPublished: true,
      ...(filters.category ? { category: { slug: filters.category } } : {}),
      ...(filters.productType ? { productType: filters.productType } : {}),
      ...(filters.fabric
        ? { fabricOptions: { some: { fabric: { code: filters.fabric } } } }
        : {}),
    };

    const records = await prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: buildOrderBy(filters.sort),
    });
    return records.map(toProduct);
  }, []);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return safeQuery(async () => {
    const record = await prisma.product.findFirst({
      where: { slug, isPublished: true },
      include: productInclude,
    });
    return record ? toProduct(record) : null;
  }, null);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return safeQuery(async () => {
    const records = await prisma.product.findMany({
      where: { isPublished: true },
      include: productInclude,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return records.map(toProduct);
  }, []);
}

export async function searchProducts(query: string): Promise<Product[]> {
  if (query.trim().length < 2) return [];
  return safeQuery(async () => {
    const records = await prisma.product.findMany({
      where: {
        isPublished: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { romanUrduKeywords: { contains: query, mode: "insensitive" } },
        ],
      },
      include: productInclude,
      take: 24,
    });
    return records.map(toProduct);
  }, []);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return safeQuery(async () => {
    const record = await prisma.category.findFirst({ where: { slug } });
    if (!record) return null;
    return {
      id: record.id,
      slug: record.slug,
      name: record.name,
      parentId: record.parentId,
      metaTitle: record.metaTitle,
      metaDescription: record.metaDescription,
      introCopy: record.introCopy,
    };
  }, null);
}

export async function getFabrics(): Promise<Fabric[]> {
  return safeQuery(async () => {
    const records = await prisma.fabric.findMany({ orderBy: { name: "asc" } });
    return records.map((fabric) => ({
      id: fabric.id,
      code: fabric.code,
      name: fabric.name,
      composition: fabric.composition,
      color: fabric.color,
    }));
  }, []);
}
