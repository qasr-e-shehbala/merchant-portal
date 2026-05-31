import type { Metadata } from "next";
import Link from "next/link";
import { DataTable, Pagination, type Column } from "@/components/admin/data-table";
import { formatDate } from "@/lib/utils";
import { listCustomers, type CustomerRow } from "@/server/customers/queries";

export const metadata: Metadata = { title: "Customers" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const COLUMNS: Column<CustomerRow>[] = [
  {
    key: "contact",
    header: "Customer",
    cell: (row) => (
      <div>
        <p className="text-xs font-medium text-gray-900">{row.name ?? "—"}</p>
        <a href={`tel:${row.phone}`} className="text-xs text-gray-400 hover:text-gray-700">{row.phone}</a>
      </div>
    ),
  },
  {
    key: "city",
    header: "City",
    cell: (row) => <span className="text-xs text-gray-500">{row.city ?? "—"}</span>,
  },
  {
    key: "orders",
    header: "Orders",
    cell: (row) => (
      <span className={`text-xs font-medium ${row.orderCount > 0 ? "text-gray-900" : "text-gray-400"}`}>
        {row.orderCount}
      </span>
    ),
  },
  {
    key: "joined",
    header: "Joined",
    cell: (row) => <time className="text-xs text-gray-400">{formatDate(row.createdAt)}</time>,
  },
  {
    key: "actions",
    header: "",
    cell: (row) => (
      <div className="flex items-center gap-2">
        <Link href={`/orders?phone=${row.phone}`} className="text-xs text-blue-700 hover:underline">
          Orders
        </Link>
        <a
          href={`https://wa.me/${row.phone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#25D366] hover:underline"
        >
          WhatsApp
        </a>
      </div>
    ),
  },
];

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const { customers, total } = await listCustomers({ query: sp.q, page, pageSize: PAGE_SIZE });

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (sp.q) params.set("q", sp.q);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/customers?${qs}` : "/customers";
  };

  return (
    <div className="space-y-5">
      <form method="GET" className="flex gap-2">
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="Search by name or phone…"
          className="h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-violet focus:outline-none focus:ring-1 focus:ring-violet w-64"
        />
        <button type="submit" className="h-9 rounded-lg bg-ink px-4 text-xs font-medium text-ivory">
          Search
        </button>
      </form>

      <DataTable columns={COLUMNS} data={customers} keyField="id" emptyMessage="No customers yet." caption="Customers" />
      <Pagination page={page} total={total} pageSize={PAGE_SIZE} buildHref={buildHref} />
    </div>
  );
}
