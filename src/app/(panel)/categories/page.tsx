import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { listAdminCategories } from "@/server/catalog/category-queries";
import { deleteCategoryAction } from "@/server/catalog/category-mutations";
import { DeleteButton } from "@/components/admin/delete-button";

export const metadata: Metadata = { title: "Categories" };
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await listAdminCategories();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{categories.length} categories</p>
        <Link
          href="/categories/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-royal to-jewel px-4 py-2 text-xs font-semibold text-white hover:brightness-110 transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          New Category
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {["Category", "Slug", "Parent", "Products", "Intro Copy", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                  No categories yet. <Link href="/categories/new" className="text-terracotta hover:underline">Create one.</Link>
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 text-xs">{cat.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{cat.slug}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{cat.parentName ?? "—"}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className={`font-medium ${cat.productCount > 0 ? "text-gray-900" : "text-gray-300"}`}>
                      {cat.productCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 max-w-xs truncate">
                    {cat.introCopy ? cat.introCopy.slice(0, 60) + "…" : <span className="text-gray-300">Not set</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/categories/${cat.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-royal hover:bg-royal/10 transition-colors"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Link>
                      <DeleteButton
                        id={cat.id}
                        action={deleteCategoryAction}
                        confirmMessage={`Delete "${cat.name}"? ${cat.productCount > 0 ? `It has ${cat.productCount} products — move them first.` : "This cannot be undone."}`}
                        disabled={cat.productCount > 0}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
