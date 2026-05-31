import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Copy } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { ImageUploader } from "@/components/admin/image-uploader";
import { FabricLinker } from "@/components/admin/fabric-linker";
import { updateProductAction, togglePublishAction } from "@/server/catalog/mutations";
import { deleteProductAction, duplicateProductAction } from "@/server/catalog/product-mutations-extended";
import { getAdminProduct, getCategories, getAllFabrics } from "@/server/catalog/admin-queries";

export const metadata: Metadata = { title: "Edit Product" };
export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories, allFabrics] = await Promise.all([
    getAdminProduct(id),
    getCategories(),
    getAllFabrics(),
  ]);
  if (!product) notFound();

  const boundUpdate = updateProductAction.bind(null, id);

  async function togglePublish() {
    "use server";
    await togglePublishAction(id, !product!.isPublished);
  }

  async function deleteProduct() {
    "use server";
    await deleteProductAction(id);
  }

  async function duplicateProduct() {
    "use server";
    await duplicateProductAction(id);
  }

  const linkedFabricIds = product.fabricOptions.map((fo) => fo.fabric.id);

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/products" className="rounded-full p-2 text-gray-400 hover:bg-gray-100 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-base font-semibold text-gray-900">{product.name}</h2>
            <p className="flex items-center gap-1 text-xs text-gray-500">
              <span className="font-mono">{product.slug}</span>
              <span>·</span>
              <span className={product.isPublished ? "text-emerald-600" : "text-gray-400"}>
                {product.isPublished ? "Live" : "Draft"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            View
          </Link>

          <form action={duplicateProduct}>
            <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
              <Copy className="h-3 w-3" />
              Duplicate
            </button>
          </form>

          <form action={togglePublish}>
            <button type="submit" className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              product.isPublished
                ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}>
              {product.isPublished ? "Unpublish" : "Publish"}
            </button>
          </form>

          <form action={deleteProduct}>
            <button type="submit"
              onClick={(e) => { if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) e.preventDefault(); }}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors">
              Delete
            </button>
          </form>
        </div>
      </div>

      {/* Photos */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">
          Product Photos
          <span className="ml-2 text-xs font-normal text-gray-400">({product.images.length} uploaded)</span>
        </h3>
        <ImageUploader productId={id} images={product.images} />
      </section>

      {/* Fabric links */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-1 text-sm font-semibold text-gray-900">Available Fabrics</h3>
        <p className="mb-4 text-xs text-gray-400">Select which fabrics this product can be made in. Shown as options on the product page.</p>
        <FabricLinker productId={id} allFabrics={allFabrics} linkedFabricIds={linkedFabricIds} />
      </section>

      {/* Details form */}
      <ProductForm
        action={boundUpdate}
        categories={categories}
        defaultValues={{
          name: product.name,
          description: product.description ?? undefined,
          categorySlug: product.category?.slug ?? undefined,
          productType: product.productType,
          basePriceRupees: Number(product.basePriceMinor) / 100,
          isPublished: product.isPublished,
          metaTitle: product.metaTitle ?? undefined,
          metaDescription: product.metaDescription ?? undefined,
          romanUrduKeywords: product.romanUrduKeywords ?? undefined,
        }}
        submitLabel="Save Changes"
      />
    </div>
  );
}
