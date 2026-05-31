import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CategoryForm } from "@/components/admin/category-form";
import { createCategoryAction } from "@/server/catalog/category-mutations";
import { listAdminCategories } from "@/server/catalog/category-queries";

export const metadata: Metadata = { title: "New Category" };

export default async function NewCategoryPage() {
  const categories = await listAdminCategories();

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/categories" className="rounded-full p-2 text-gray-400 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h2 className="text-base font-semibold text-gray-900">New Category</h2>
      </div>
      <CategoryForm action={createCategoryAction} parentOptions={categories} />
    </div>
  );
}
