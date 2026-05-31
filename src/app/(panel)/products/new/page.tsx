import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { createProductAction } from "@/server/catalog/mutations";
import { getCategories } from "@/server/catalog/admin-queries";

export const metadata: Metadata = { title: "New Product" };

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/products" className="rounded-full p-2 text-gray-400 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
        <div>
          <h2 className="text-base font-semibold text-gray-900">New Product</h2>
          <p className="text-xs text-gray-500">Add a sherwani, prince coat, waistcoat, or accessory</p>
        </div>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800">
        After saving, you will be taken to the edit page where you can upload product photos.
      </div>

      <ProductForm
        action={createProductAction}
        categories={categories}
        submitLabel="Create Product"
      />
    </div>
  );
}
