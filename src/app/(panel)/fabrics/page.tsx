import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { listAdminFabrics } from "@/server/catalog/fabric-queries";
import { deleteFabricAction } from "@/server/catalog/fabric-mutations";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatPKR } from "@/lib/utils";

export const metadata: Metadata = { title: "Fabrics" };
export const dynamic = "force-dynamic";

export default async function FabricsPage() {
  const fabrics = await listAdminFabrics();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{fabrics.length} fabrics</p>
        <Link
          href="/fabrics/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-charcoal px-4 py-2 text-xs font-semibold text-white hover:bg-charcoal-soft transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          New Fabric
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {["Code", "Fabric", "Composition", "Colour", "Cost/m", "Products", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {fabrics.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                  No fabrics yet. <Link href="/fabrics/new" className="text-terracotta hover:underline">Add one.</Link>
                </td>
              </tr>
            ) : fabrics.map((fabric) => (
              <tr key={fabric.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{fabric.code}</td>
                <td className="px-4 py-3 text-xs font-medium text-gray-900">{fabric.name}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{fabric.composition ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{fabric.color ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {fabric.costPerMeterMinor ? formatPKR(BigInt(fabric.costPerMeterMinor)) : "—"}
                </td>
                <td className="px-4 py-3 text-xs font-medium text-gray-700">{fabric.productCount}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/fabrics/${fabric.id}/edit`}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-royal hover:bg-royal/10 transition-colors"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Link>
                    <DeleteButton
                      id={fabric.id}
                      action={deleteFabricAction}
                      disabled={fabric.productCount > 0}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
