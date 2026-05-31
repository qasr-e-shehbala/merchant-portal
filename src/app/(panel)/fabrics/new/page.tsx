import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FabricForm } from "@/components/admin/fabric-form";
import { createFabricAction } from "@/server/catalog/fabric-mutations";

export const metadata: Metadata = { title: "New Fabric" };

export default function NewFabricPage() {
  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/fabrics" className="rounded-full p-2 text-gray-400 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h2 className="text-base font-semibold text-gray-900">New Fabric</h2>
      </div>
      <FabricForm action={createFabricAction} />
    </div>
  );
}
