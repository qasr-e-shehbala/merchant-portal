import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CategoryForm } from "@/components/admin/category-form";
import { updateCategoryAction } from "@/server/catalog/category-mutations";
import { getAdminCategory, listAdminCategories } from "@/server/catalog/category-queries";

export const metadata: Metadata = { title: "Edit Category" };
export const dynamic = "force-dynamic";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [category, allCategories] = await Promise.all([
    getAdminCategory(id),
    listAdminCategories(),
  ]);
  if (!category) notFound();

  const boundUpdate = updateCategoryAction.bind(null, id);

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/categories" className="rounded-full p-2 text-gray-400 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-base font-semibold text-gray-900">{category.name}</h2>
          <p className="text-xs font-mono text-gray-400">{category.slug}</p>
        </div>
      </div>
      <CategoryForm
        action={boundUpdate}
        parentOptions={allCategories.filter((c) => c.id !== id)}
        defaultValues={{
          name: category.name,
          parentId: category.parentId ?? undefined,
          metaTitle: category.metaTitle ?? undefined,
          metaDescription: category.metaDescription ?? undefined,
          introCopy: category.introCopy ?? undefined,
        }}
        submitLabel="Save Changes"
      />
    </div>
  );
}
