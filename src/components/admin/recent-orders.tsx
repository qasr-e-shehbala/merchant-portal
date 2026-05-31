import Link from "next/link";
import { DataTable, type Column } from "./data-table";
import { OrderStatusBadge, PaymentStatusBadge } from "./status-badge";
import { formatPKR, formatDate } from "@/lib/utils";
import { getRecentOrders, type OrderRow } from "@/server/orders/queries";

const COLUMNS: Column<OrderRow>[] = [
  {
    key: "ref",
    header: "Ref",
    cell: (row) => (
      <Link
        href={`/orders/${row.id}`}
        className="font-mono text-xs font-semibold text-[#c9a227] hover:underline"
      >
        {row.orderRef}
      </Link>
    ),
  },
  {
    key: "customer",
    header: "Customer",
    cell: (row) => <span className="font-medium text-gray-900">{row.customerName}</span>,
  },
  {
    key: "total",
    header: "Total",
    cell: (row) => (
      <span className="tabular-nums">{formatPKR(BigInt(row.totalMinor))}</span>
    ),
  },
  {
    key: "orderStatus",
    header: "Order",
    cell: (row) => <OrderStatusBadge status={row.orderStatus as never} />,
  },
  {
    key: "paymentStatus",
    header: "Payment",
    cell: (row) => <PaymentStatusBadge status={row.paymentStatus as never} />,
  },
  {
    key: "date",
    header: "Date",
    cell: (row) => (
      <time dateTime={row.createdAt} className="text-xs text-gray-400">
        {formatDate(row.createdAt)}
      </time>
    ),
  },
];

export async function RecentOrders() {
  const orders = await getRecentOrders();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Recent Orders</h2>
        <Link href="/orders" className="text-xs font-medium text-[#c9a227] hover:underline">
          View all →
        </Link>
      </div>
      <DataTable
        columns={COLUMNS}
        data={orders}
        keyField="id"
        emptyMessage="No orders yet. They will appear here once created."
        caption="Recent orders"
      />
    </div>
  );
}
