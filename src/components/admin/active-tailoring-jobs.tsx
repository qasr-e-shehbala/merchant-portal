import Link from "next/link";
import { TailoringStageBadge } from "./status-badge";
import { getActiveTailoringJobs } from "@/server/orders/queries";

export async function ActiveTailoringJobs() {
  const jobs = await getActiveTailoringJobs();

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Active Tailoring Jobs</h2>
        <Link href="/tailoring" className="text-xs font-medium text-[#c9a227] hover:underline">
          View all →
        </Link>
      </div>

      {jobs.length === 0 ? (
        <p className="text-xs text-gray-400">No active tailoring jobs.</p>
      ) : (
        <ul className="space-y-3">
          {jobs.slice(0, 6).map((job) => (
            <li key={job.id} className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  href={`/tailoring?job=${job.id}`}
                  className="text-xs font-semibold text-gray-900 hover:text-[#c9a227] truncate block"
                >
                  {job.orderRef}
                </Link>
                <p className="text-xs text-gray-400 truncate">{job.productName}</p>
                {job.promisedReadyDate && (
                  <p className={`text-xs mt-0.5 ${job.isOverdue ? "text-red-600 font-medium" : "text-gray-400"}`}>
                    Due {new Date(job.promisedReadyDate).toLocaleDateString("en-PK")}
                    {job.isOverdue && " ⚠️ Overdue"}
                  </p>
                )}
              </div>
              <TailoringStageBadge stage={job.stage as never} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
