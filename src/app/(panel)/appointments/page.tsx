import type { Metadata } from "next";
import Link from "next/link";
import { DataTable, Pagination, type Column } from "@/components/admin/data-table";
import { listAppointments, type AppointmentRow } from "@/server/appointments/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Appointments" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const STATUS_COLOURS: Record<string, string> = {
  SCHEDULED: "bg-blue-50 text-blue-700",
  DONE: "bg-emerald-50 text-emerald-700",
  NO_SHOW: "bg-red-50 text-red-600",
  RESCHEDULED: "bg-amber-50 text-amber-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

const FILTERS = ["all", "SCHEDULED", "DONE", "NO_SHOW", "RESCHEDULED"];

const COLUMNS: Column<AppointmentRow>[] = [
  {
    key: "customer",
    header: "Customer",
    cell: (row) => (
      <div>
        <p className="text-xs font-medium text-gray-900">{row.customerName ?? "—"}</p>
        <a href={`tel:${row.customerPhone}`} className="text-xs text-gray-400 hover:text-gray-700">{row.customerPhone}</a>
      </div>
    ),
  },
  { key: "type", header: "Type", cell: (row) => <span className="text-xs text-gray-600">{row.type.replace(/_/g, " ")}</span> },
  {
    key: "when",
    header: "Date & Time",
    cell: (row) => (
      <time className="text-xs text-gray-700">
        {new Date(row.scheduledAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
      </time>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (row) => (
      <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_COLOURS[row.status] ?? "bg-gray-100 text-gray-600")}>
        {row.status.replace(/_/g, " ")}
      </span>
    ),
  },
  { key: "staff", header: "Handled By", cell: (row) => <span className="text-xs text-gray-500">{row.staffName ?? "—"}</span> },
];

export default async function AppointmentsPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const status = sp.status && sp.status !== "all" ? sp.status : undefined;
  const { appointments, total } = await listAppointments({ status, page, pageSize: PAGE_SIZE });

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/appointments?${qs}` : "/appointments";
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((value) => {
          const active = (sp.status ?? "all") === value;
          return (
            <Link
              key={value}
              href={value === "all" ? "/appointments" : `/appointments?status=${value}`}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                active ? "border-jewel bg-jewel/10 text-jewel" : "border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              {value === "all" ? "All" : value.replace(/_/g, " ")}
            </Link>
          );
        })}
      </div>

      <DataTable columns={COLUMNS} data={appointments} keyField="id" emptyMessage="No appointments found." caption="Appointments" />
      <Pagination page={page} total={total} pageSize={PAGE_SIZE} buildHref={buildHref} />
    </div>
  );
}
