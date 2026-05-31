import type { Metadata } from "next";
import { DataTable, type Column } from "@/components/admin/data-table";
import { LiveRefresh } from "@/components/admin/live-refresh";
import { formatDate } from "@/lib/utils";
import { getLeads, type LeadRow } from "@/server/leads/queries";

export const metadata: Metadata = { title: "WhatsApp Leads" };
export const dynamic = "force-dynamic";

const COLUMNS: Column<LeadRow>[] = [
  {
    key: "ref",
    header: "Ref",
    cell: (r) => <span className="font-mono text-xs font-bold text-gray-700">{r.ref}</span>,
  },
  {
    key: "contact",
    header: "Contact",
    cell: (r) => (
      <div>
        <p className="text-xs font-medium text-gray-900">{r.customerName ?? "Unknown"}</p>
        <a href={`tel:${r.phone}`} className="text-xs text-gray-500 hover:text-gray-700">{r.phone}</a>
      </div>
    ),
  },
  {
    key: "city",
    header: "City",
    cell: (r) => <span className="text-xs text-gray-500">{r.city ?? "—"}</span>,
  },
  {
    key: "source",
    header: "Source",
    cell: (r) => (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
        {r.source.replace(/_/g, " ")}
      </span>
    ),
  },
  {
    key: "product",
    header: "Enquiry",
    cell: (r) => <span className="text-xs text-gray-500">{r.productName ?? "General"}</span>,
  },
  {
    key: "stage",
    header: "Stage",
    cell: (r) => (
      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
        {r.stage.replace(/_/g, " ")}
      </span>
    ),
  },
  {
    key: "whatsapp",
    header: "Open",
    cell: (r) => (
      <a
        href={`https://wa.me/${r.phone}?text=${encodeURIComponent(`Assalam o Alaikum! Following up on your enquiry (ref: ${r.ref}).`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs font-medium text-[#25D366] hover:underline"
      >
        WhatsApp
      </a>
    ),
  },
  {
    key: "date",
    header: "Date",
    cell: (r) => <time className="text-xs text-gray-400">{formatDate(r.createdAt)}</time>,
  },
];

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-gray-900">WhatsApp & Web Leads</h1>
        <LiveRefresh />
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <strong>Tip:</strong> Web enquiries land here automatically the moment a customer taps WhatsApp or
        submits a form on the website. Walk-in and direct contacts can be added as orders from the Orders page.
      </div>

      <DataTable
        columns={COLUMNS}
        data={leads}
        keyField="id"
        emptyMessage="No leads yet. They appear here from web enquiries, walk-ins, and WhatsApp contacts."
        caption="Leads list"
      />
    </div>
  );
}
