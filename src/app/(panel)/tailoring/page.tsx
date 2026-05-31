import type { Metadata } from "next";
import Link from "next/link";
import { DataTable, type Column } from "@/components/admin/data-table";
import { TailoringStageBadge } from "@/components/admin/status-badge";
import { TailoringStageButton } from "@/components/admin/tailoring-stage-button";

export const metadata: Metadata = { title: "Tailoring Jobs" };
export const dynamic = "force-dynamic";

interface JobRow {
  id: string;
  orderRef: string;
  customerName: string;
  productName: string;
  stage: string;
  assignedTailor?: string;
  promisedReadyDate?: string;
  isRemote: boolean;
  reworkCount: number;
}

// TODO: Replace with Prisma query
async function getJobs(): Promise<JobRow[]> {
  return [];
}

// Server action that wraps the Prisma stage transition.
// The state machine is enforced in the OrderModule service; the UI only offers legal transitions.
async function advanceStage(_jobId: string, _newStage: string): Promise<void> {
  "use server";
  // await orderService.advanceTailoringStage(jobId, newStage, actorId);
}

const COLUMNS: Column<JobRow>[] = [
  {
    key: "ref",
    header: "Order",
    cell: (r) => (
      <Link href={`/orders/${r.orderRef}`} className="font-mono text-xs font-bold text-[#c9a227] hover:underline">
        {r.orderRef}
      </Link>
    ),
  },
  {
    key: "customer",
    header: "Customer",
    cell: (r) => <span className="text-xs font-medium text-gray-900">{r.customerName}</span>,
  },
  {
    key: "product",
    header: "Garment",
    cell: (r) => (
      <div>
        <p className="text-xs text-gray-700">{r.productName}</p>
        {r.isRemote && <p className="text-xs text-orange-500">Remote order</p>}
        {r.reworkCount > 0 && (
          <p className="text-xs text-red-500">Rework ×{r.reworkCount}</p>
        )}
      </div>
    ),
  },
  {
    key: "stage",
    header: "Stage",
    cell: (r) => <TailoringStageBadge stage={r.stage as never} />,
  },
  {
    key: "tailor",
    header: "Karigar",
    cell: (r) => <span className="text-xs text-gray-500">{r.assignedTailor ?? "—"}</span>,
  },
  {
    key: "due",
    header: "Due",
    cell: (r) =>
      r.promisedReadyDate ? (
        <time className="text-xs text-gray-400">
          {new Date(r.promisedReadyDate).toLocaleDateString("en-PK")}
        </time>
      ) : (
        <span className="text-xs text-gray-300">—</span>
      ),
  },
  {
    key: "advance",
    header: "Advance",
    cell: (r) => (
      <TailoringStageButton
        jobId={r.id}
        currentStage={r.stage}
        onAdvance={advanceStage}
      />
    ),
  },
];

export default async function TailoringPage() {
  const jobs = await getJobs();

  return (
    <div className="space-y-5">
      {/* Stage filter pills */}
      <div className="flex flex-wrap gap-2">
        {["All", "CUTTING", "STITCHING", "FITTING", "REWORK", "FINISHING", "READY"].map((s) => (
          <Link
            key={s}
            href={s === "All" ? "/tailoring" : `/tailoring?stage=${s}`}
            className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:border-gray-300 transition-colors"
          >
            {s}
          </Link>
        ))}
      </div>

      <DataTable
        columns={COLUMNS}
        data={jobs}
        keyField="id"
        emptyMessage="No active tailoring jobs."
        caption="Tailoring jobs"
      />
    </div>
  );
}
