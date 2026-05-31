import Link from "next/link";
import { formatPKR } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import { getPendingPayments } from "@/server/orders/queries";

export async function PendingPayments() {
  const payments = await getPendingPayments();

  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">
          Pending Verifications
          {payments.length > 0 && (
            <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs text-white">
              {payments.length}
            </span>
          )}
        </h2>
        <Link
          href="/orders?paymentStatus=PENDING"
          className="text-xs font-medium text-orange-700 hover:underline"
        >
          View all →
        </Link>
      </div>

      {payments.length === 0 ? (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <CheckCircle className="h-4 w-4 text-emerald-400" aria-hidden="true" />
          All payments verified
        </div>
      ) : (
        <ul className="space-y-3">
          {payments.slice(0, 5).map((p) => (
            <li key={p.id} className="flex items-center justify-between text-xs">
              <div>
                <Link
                  href={`/orders/${p.orderId}#payment-${p.id}`}
                  className="font-semibold text-orange-700 hover:underline"
                >
                  {p.orderRef}
                </Link>
                <p className="text-gray-500 mt-0.5">
                  {p.method} · {p.senderName ?? "Unknown"}
                </p>
              </div>
              <span className="font-semibold text-gray-900">
                {formatPKR(BigInt(p.amountMinor))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
