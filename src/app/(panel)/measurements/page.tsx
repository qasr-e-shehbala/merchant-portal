import type { Metadata } from "next";
import { DataTable, Pagination, type Column } from "@/components/admin/data-table";
import { formatDate } from "@/lib/utils";
import { listMeasurements, type MeasurementRow } from "@/server/measurements/queries";

export const metadata: Metadata = { title: "Measurements" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const COLUMNS: Column<MeasurementRow>[] = [
  {
    key: "customer",
    header: "Customer",
    cell: (row) => (
      <div>
        <p className="text-xs font-medium text-gray-900">{row.customerName ?? "—"}</p>
        <p className="text-xs text-gray-400">{row.customerPhone}</p>
      </div>
    ),
  },
  { key: "label", header: "Profile", cell: (row) => <span className="text-xs font-medium text-gray-900">{row.label}</span> },
  {
    key: "garment",
    header: "Garment",
    cell: (row) => <span className="text-xs text-gray-500">{row.garmentType ?? "General"}</span>,
  },
  {
    key: "default",
    header: "Default",
    cell: (row) =>
      row.isDefault ? (
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">Default</span>
      ) : null,
  },
  {
    key: "updated",
    header: "Updated",
    cell: (row) => <time className="text-xs text-gray-400">{formatDate(row.updatedAt)}</time>,
  },
];

export default async function MeasurementsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const { rows, total } = await listMeasurements({ page, pageSize: PAGE_SIZE });

  const buildHref = (p: number) => (p > 1 ? `/measurements?page=${p}` : "/measurements");

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        Measurement profiles are attached to customers. Editing a profile does not affect in-production orders — those use a snapshot taken at order time.
      </p>
      <DataTable columns={COLUMNS} data={rows} keyField="id" emptyMessage="No measurement profiles yet." caption="Measurements" />
      <Pagination page={page} total={total} pageSize={PAGE_SIZE} buildHref={buildHref} />
    </div>
  );
}
