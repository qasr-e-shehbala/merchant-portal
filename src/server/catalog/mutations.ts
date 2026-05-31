"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ProductType } from "@prisma/client";
import { prisma } from "@/server/db/client";
import { slugify } from "@/lib/utils";

const productSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  categorySlug: z.string().optional(),
  productType: z.enum(["STOCK", "MADE_TO_ORDER", "BOTH"]),
  basePriceRupees: z.coerce.number().min(0),
  isPublished: z.coerce.boolean().optional(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  romanUrduKeywords: z.string().max(300).optional(),
});

export type ProductFormState = { error?: string; fieldErrors?: Record<string, string[]> };

export async function createProductAction(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const raw = Object.fromEntries(formData);
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const slug = slugify(data.name);

  let categoryId: string | undefined;
  if (data.categorySlug) {
    const cat = await prisma.category.findFirst({ where: { slug: data.categorySlug } });
    categoryId = cat?.id;
  }

  const product = await prisma.product.create({
    data: {
      slug,
      name: data.name,
      description: data.description || null,
      productType: data.productType as ProductType,
      categoryId: categoryId || null,
      basePriceMinor: BigInt(Math.round(data.basePriceRupees * 100)),
      isPublished: data.isPublished ?? false,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      romanUrduKeywords: data.romanUrduKeywords || null,
      variants: {
        create: [{
          sku: `${slug.toUpperCase().replace(/-/g, "").slice(0, 12)}-MTO`,
          attributes: { size: "Custom" },
          isStockTracked: data.productType === "STOCK",
        }],
      },
    },
  });

  revalidatePath("/products");
  revalidatePath("/collections");
  redirect(`/products/${product.id}/edit`);
}

export async function updateProductAction(
  id: string,
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const raw = Object.fromEntries(formData);
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  let categoryId: string | null = null;
  if (data.categorySlug) {
    const cat = await prisma.category.findFirst({ where: { slug: data.categorySlug } });
    categoryId = cat?.id ?? null;
  }

  await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description || null,
      productType: data.productType as ProductType,
      categoryId,
      basePriceMinor: BigInt(Math.round(data.basePriceRupees * 100)),
      isPublished: data.isPublished ?? false,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      romanUrduKeywords: data.romanUrduKeywords || null,
    },
  });

  revalidatePath("/products");
  revalidatePath(`/products/${(await prisma.product.findUnique({ where: { id }, select: { slug: true } }))?.slug}`);
  return {};
}

export async function togglePublishAction(id: string, isPublished: boolean): Promise<void> {
  const product = await prisma.product.update({ where: { id }, data: { isPublished } });
  revalidatePath("/products");
  revalidatePath(`/products/${product.slug}`);
  revalidatePath("/collections");
}

export async function deleteProductImageAction(imageId: string, productId: string): Promise<void> {
  await prisma.productImage.delete({ where: { id: imageId } });
  revalidatePath(`/products/${productId}/edit`);
}

export async function addProductImageAction(
  productId: string,
  r2Key: string,
  alt: string,
  sortOrder: number
): Promise<void> {
  await prisma.productImage.create({ data: { productId, r2Key, alt, sortOrder } });
  revalidatePath(`/products/${productId}/edit`);
}
