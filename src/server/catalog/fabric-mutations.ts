"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/server/db/client";

const fabricSchema = z.object({
  code: z.string().min(1).max(20).toUpperCase(),
  name: z.string().min(2).max(100),
  composition: z.string().max(200).optional(),
  color: z.string().max(100).optional(),
  costPerMeterRupees: z.coerce.number().min(0).optional(),
  supplierNote: z.string().max(500).optional(),
});

export type FabricFormState = { error?: string; fieldErrors?: Record<string, string[]> };

export async function createFabricAction(
  _prev: FabricFormState,
  formData: FormData
): Promise<FabricFormState> {
  const parsed = fabricSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };

  const { code, name, costPerMeterRupees, composition, color, supplierNote } = parsed.data;

  const existing = await prisma.fabric.findFirst({ where: { code } });
  if (existing) return { error: `Fabric code "${code}" already exists.` };

  await prisma.fabric.create({
    data: {
      code,
      name,
      composition: composition || null,
      color: color || null,
      costPerMeterMinor: costPerMeterRupees ? BigInt(Math.round(costPerMeterRupees * 100)) : null,
      supplierNote: supplierNote || null,
    },
  });

  revalidatePath("/fabrics");
  redirect("/fabrics");
}

export async function updateFabricAction(
  id: string,
  _prev: FabricFormState,
  formData: FormData
): Promise<FabricFormState> {
  const parsed = fabricSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };

  const { code, name, costPerMeterRupees, composition, color, supplierNote } = parsed.data;

  await prisma.fabric.update({
    where: { id },
    data: {
      code,
      name,
      composition: composition || null,
      color: color || null,
      costPerMeterMinor: costPerMeterRupees ? BigInt(Math.round(costPerMeterRupees * 100)) : null,
      supplierNote: supplierNote || null,
    },
  });

  revalidatePath("/fabrics");
  return {};
}

export async function deleteFabricAction(id: string): Promise<{ error?: string }> {
  const usedCount = await prisma.productFabricOption.count({ where: { fabricId: id } });
  if (usedCount > 0) {
    return { error: `Cannot delete — this fabric is linked to ${usedCount} product(s). Remove those links first.` };
  }
  await prisma.fabric.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/fabrics");
  return {};
}
