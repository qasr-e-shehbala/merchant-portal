"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/server/db/client";
import { slugify } from "@/lib/utils";

const categorySchema = z.object({
  name: z.string().min(2).max(100),
  parentSlug: z.string().optional(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  introCopy: z.string().max(1000).optional(),
});

export type CategoryFormState = { error?: string; fieldErrors?: Record<string, string[]> };

export async function createCategoryAction(
  _prev: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };

  const { name, parentSlug, ...rest } = parsed.data;
  const slug = slugify(name);

  const existing = await prisma.category.findFirst({ where: { slug } });
  if (existing) return { error: `Slug "${slug}" already exists. Choose a different name.` };

  let parentId: string | undefined;
  if (parentSlug) {
    const parent = await prisma.category.findFirst({ where: { slug: parentSlug } });
    parentId = parent?.id;
  }

  await prisma.category.create({
    data: { slug, name, parentId, ...filterEmpty(rest) },
  });

  revalidatePath("/categories");
  revalidatePath("/collections");
  redirect("/categories");
}

export async function updateCategoryAction(
  id: string,
  _prev: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };

  const { name, parentSlug, ...rest } = parsed.data;

  let parentId: string | null = null;
  if (parentSlug) {
    const parent = await prisma.category.findFirst({ where: { slug: parentSlug } });
    parentId = parent?.id ?? null;
  }

  await prisma.category.update({
    where: { id },
    data: { name, parentId, ...filterEmpty(rest) },
  });

  revalidatePath("/categories");
  revalidatePath("/collections");
  return {};
}

export async function deleteCategoryAction(id: string): Promise<{ error?: string }> {
  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return { error: `Cannot delete — ${productCount} product(s) are in this category. Move them first.` };
  }
  await prisma.category.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/categories");
  return {};
}

function filterEmpty(obj: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v?.trim() || null])
  );
}
