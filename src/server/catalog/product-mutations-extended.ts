"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/server/db/client";
import { slugify } from "@/lib/utils";

export async function deleteProductAction(id: string): Promise<{ error?: string }> {
  const product = await prisma.product.findUnique({ where: { id }, select: { slug: true } });
  if (!product) return { error: "Product not found" };

  await prisma.product.update({ where: { id }, data: { deletedAt: new Date(), isPublished: false } });
  revalidatePath("/products");
  revalidatePath("/collections");
  redirect("/products");
}

const variantSchema = z.object({
  sku: z.string().min(1).max(50),
  size: z.string().max(50).optional(),
  color: z.string().max(50).optional(),
  isStockTracked: z.coerce.boolean().optional(),
  priceOverrideRupees: z.coerce.number().min(0).optional(),
});

export type VariantFormState = { error?: string; fieldErrors?: Record<string, string[]> };

export async function addVariantAction(
  productId: string,
  _prev: VariantFormState,
  formData: FormData
): Promise<VariantFormState> {
  const parsed = variantSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };

  const { sku, size, color, isStockTracked, priceOverrideRupees } = parsed.data;

  const existing = await prisma.productVariant.findFirst({ where: { sku } });
  if (existing) return { error: `SKU "${sku}" already exists.` };

  const attrs: Record<string, string> = {};
  if (size) attrs.size = size;
  if (color) attrs.color = color;

  await prisma.productVariant.create({
    data: {
      productId,
      sku,
      attributes: attrs,
      isStockTracked: isStockTracked ?? false,
      priceOverrideMinor: priceOverrideRupees ? BigInt(Math.round(priceOverrideRupees * 100)) : null,
    },
  });

  revalidatePath(`/products/${productId}/edit`);
  return {};
}

export async function deleteVariantAction(variantId: string, productId: string): Promise<void> {
  await prisma.productVariant.update({
    where: { id: variantId },
    data: { deletedAt: new Date() },
  });
  revalidatePath(`/products/${productId}/edit`);
}

export async function updateStockLevelAction(variantId: string, branchId: string, onHand: number): Promise<void> {
  await prisma.stockLevel.upsert({
    where: { variantId_branchId: { variantId, branchId } },
    update: { onHand },
    create: { variantId, branchId, onHand },
  });
  revalidatePath("/inventory");
}

export async function linkFabricAction(productId: string, fabricId: string): Promise<void> {
  await prisma.productFabricOption.upsert({
    where: { productId_fabricId: { productId, fabricId } },
    update: {},
    create: { productId, fabricId },
  });
  revalidatePath(`/products/${productId}/edit`);
}

export async function unlinkFabricAction(productId: string, fabricId: string): Promise<void> {
  await prisma.productFabricOption.delete({
    where: { productId_fabricId: { productId, fabricId } },
  });
  revalidatePath(`/products/${productId}/edit`);
}

export async function updateImageAltAction(imageId: string, productId: string, alt: string): Promise<void> {
  await prisma.productImage.update({ where: { id: imageId }, data: { alt: alt.trim() } });
  revalidatePath(`/products/${productId}/edit`);
}

export async function reorderImagesAction(productId: string, orderedIds: string[]): Promise<void> {
  await Promise.all(
    orderedIds.map((id, index) =>
      prisma.productImage.update({ where: { id }, data: { sortOrder: index } })
    )
  );
  revalidatePath(`/products/${productId}/edit`);
}

export async function duplicateProductAction(id: string): Promise<{ error?: string }> {
  const original = await prisma.product.findUnique({
    where: { id },
    include: { fabricOptions: true },
  });
  if (!original) return { error: "Product not found" };

  const newSlug = slugify(`${original.name} copy`);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { slug: _s, createdAt: _ca, updatedAt: _ua, deletedAt: _da, id: _oid, fabricOptions: _fo, ...data } = original;

  const created = await prisma.product.create({
    data: {
      ...data,
      slug: newSlug,
      name: `${original.name} (Copy)`,
      isPublished: false,
      fabricOptions: {
        create: original.fabricOptions.map((fo) => ({ fabricId: fo.fabricId })),
      },
    },
  });

  revalidatePath("/products");
  redirect(`/products/${created.id}/edit`);
}
