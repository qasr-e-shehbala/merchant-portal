import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DataTable, Pagination, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { formatPKR } from "@/lib/utils";
import { listAdminProducts, type AdminProductRow } from "@/server/catalog/admin-queries";

export const metadata: Metadata = { title: "Products" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const COLUMNS: Column<AdminProductRow>[] = [
  {
    key: "name",
    header: "Product",
    cell: (row) => (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-300">
          {row.imageCount > 0 ? (
            <span className="text-[10px] font-medium text-gray-500">{row.imageCount} img</span>
          ) : (
            <span className="text-[10px] text-gray-400">No img</span>
          )}
        </div>
        <div>
          <Link href={`/products/${row.id}/edit`} className="text-xs font-medium text-gray-900 hover:text-jewel hover:underline">
            {row.name}
          </Link>
          <p className="text-xs text-gray-400 font-mono">{row.slug}</p>
        </div>
      </div>
    ),
  },
  {
    key: "category",
    header: "Category",
    cell: (row) => <span className="text-xs text-gray-500">{row.categoryName ?? "—"}</span>,
  },
  {
    key: "type",
    header: "Type",
    cell: (row) => (
      <span className="text-xs text-gray-600">{row.productType.replace(/_/g, " ")}</span>
    ),
  },
  {
    key: "price",
    header: "Price",
    cell: (row) => <span className="text-xs font-medium tabular-nums">{formatPKR(BigInt(row.basePriceMinor))}</span>,
  },
  {
    key: "status",
    header: "Status",
    cell: (row) =>
      row.isPublished ? (
        <Badge variant="wine">Live</Badge>
      ) : (
        <Badge variant="outline">Draft</Badge>
      ),
  },
  {
    key: "actions",
    header: "",
    cell: (row) => (
      <div className="flex items-center gap-2">
        <Link href={`/products/${row.id}/edit`} className="text-xs text-royal hover:underline">
          Edit
        </Link>
        <Link href={`/products/${row.slug}`} target="_blank" className="text-xs text-gray-400 hover:text-gray-600">
          View ↗
        </Link>
      </div>
    ),
  },
];

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const { products, total } = await listAdminProducts({ query: sp.q, page, pageSize: PAGE_SIZE });

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (sp.q) params.set("q", sp.q);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <form method="GET" className="flex gap-2">
          <input
            name="q"
            defaultValue={sp.q}
            placeholder="Search products…"
            className="h-9 w-56 rounded-lg border border-gray-200 px-3 text-sm focus:border-violet focus:outline-none focus:ring-1 focus:ring-violet"
          />
          <button type="submit" className="h-9 rounded-lg bg-ink px-4 text-xs font-medium text-ivory">
            Search
          </button>
        </form>

        <Link
          href="/products/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-royal to-jewel px-4 py-2 text-xs font-semibold text-white hover:brightness-110 transition-all"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add Product
        </Link>
      </div>

      <DataTable
        columns={COLUMNS}
        data={products}
        keyField="id"
        emptyMessage="No products yet. Click Add Product to create your first listing."
        caption="Products"
      />
      <Pagination page={page} total={total} pageSize={PAGE_SIZE} buildHref={buildHref} />
    </div>
  );
}
