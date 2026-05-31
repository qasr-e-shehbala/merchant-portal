import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DataTable, Pagination, type Column } from "@/components/admin/data-table";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/status-badge";
import { formatPKR, formatDate } from "@/lib/utils";
import { listOrders, type OrderRow } from "@/server/orders/queries";

export const metadata: Metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;
const STATUS_FILTERS = ["all", "LEAD", "CONFIRMED", "IN_PROGRESS", "READY", "DELIVERED"];

const COLUMNS: Column<OrderRow>[] = [
  {
    key: "ref",
    header: "Ref",
    cell: (row) => (
      <Link href={`/orders/${row.id}`} className="font-mono text-xs font-bold text-[#c9a227] hover:underline">
        {row.orderRef}
      </Link>
    ),
  },
  {
    key: "customer",
    header: "Customer",
    cell: (row) => (
      <div>
        <p className="text-xs font-medium text-gray-900">{row.customerName}</p>
        <p className="text-xs text-gray-400">{row.customerPhone}</p>
      </div>
    ),
  },
  {
    key: "total",
    header: "Total",
    cell: (row) => <span className="text-xs font-medium tabular-nums">{formatPKR(BigInt(row.totalMinor))}</span>,
  },
  { key: "orderStatus", header: "Status", cell: (row) => <OrderStatusBadge status={row.orderStatus as never} /> },
  { key: "payment", header: "Payment", cell: (row) => <PaymentStatusBadge status={row.paymentStatus as never} /> },
  { key: "channel", header: "Channel", cell: (row) => <span className="text-xs text-gray-500">{row.channel}</span> },
  {
    key: "date",
    header: "Date",
    cell: (row) => <time className="text-xs text-gray-400">{formatDate(row.createdAt)}</time>,
  },
];

interface SearchParams {
  page?: string;
  status?: string;
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const status = sp.status && sp.status !== "all" ? sp.status : undefined;

  const { orders, total } = await listOrders({ status, page, pageSize: PAGE_SIZE });

  const buildHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `/orders?${qs}` : "/orders";
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((value) => {
            const isActive = (sp.status ?? "all") === value;
            return (
              <Link
                key={value}
                href={value === "all" ? "/orders" : `/orders?status=${value}`}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? "border-[#c9a227] bg-amber-50 text-[#c9a227]"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {value === "all" ? "All" : value.replace(/_/g, " ")}
              </Link>
            );
          })}
        </div>

        <Link
          href="/orders/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f0f0f] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2d2d2d] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          New Order
        </Link>
      </div>

      <DataTable
        columns={COLUMNS}
        data={orders}
        keyField="id"
        emptyMessage="No orders match the current filters."
        caption="Orders"
      />

      <Pagination page={page} total={total} pageSize={PAGE_SIZE} buildHref={buildHref} />
    </div>
  );
}
