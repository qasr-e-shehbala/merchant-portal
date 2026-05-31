import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FabricForm } from "@/components/admin/fabric-form";
import { updateFabricAction } from "@/server/catalog/fabric-mutations";
import { getAdminFabric } from "@/server/catalog/fabric-queries";

export const metadata: Metadata = { title: "Edit Fabric" };
export const dynamic = "force-dynamic";

export default async function EditFabricPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fabric = await getAdminFabric(id);
  if (!fabric) notFound();

  const boundUpdate = updateFabricAction.bind(null, id);

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/fabrics" className="rounded-full p-2 text-gray-400 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-base font-semibold text-gray-900">{fabric.name}</h2>
          <p className="text-xs font-mono text-gray-400">{fabric.code}</p>
        </div>
      </div>
      <FabricForm
        action={boundUpdate}
        editMode
        defaultValues={{
          code: fabric.code,
          name: fabric.name,
          composition: fabric.composition ?? undefined,
          color: fabric.color ?? undefined,
          costPerMeterRupees: fabric.costPerMeterMinor
            ? Number(fabric.costPerMeterMinor) / 100
            : undefined,
          supplierNote: fabric.supplierNote ?? undefined,
        }}
        submitLabel="Save Changes"
      />
    </div>
  );
}
