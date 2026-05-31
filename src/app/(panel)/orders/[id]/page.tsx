import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getOrderById } from "@/server/orders/queries";
import { formatPKR, formatDate } from "@/lib/utils";
import { OrderStatusBadge, PaymentStatusBadge, TailoringStageBadge } from "@/components/admin/status-badge";
import { TailoringStageButton } from "@/components/admin/tailoring-stage-button";
import { advanceTailoringStage } from "@/server/orders/mutations";

export const metadata: Metadata = { title: "Order Detail" };
export const dynamic = "force-dynamic";

async function advanceStage(jobId: string, nextStage: string): Promise<void> {
  "use server";
  await advanceTailoringStage(jobId, nextStage as never);
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/orders" className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
        <div>
          <h2 className="font-mono text-base font-bold text-gray-900">{order.orderRef}</h2>
          <p className="text-xs text-gray-500">{formatDate(order.createdAt.toISOString())}</p>
        </div>
        <div className="flex gap-2">
          <OrderStatusBadge status={order.orderStatus} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Order Items">
            <div className="divide-y divide-gray-50">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                    <p className="text-xs text-gray-400">
                      {item.itemKind.replace(/_/g, " ")} · qty {item.qty}
                    </p>
                    {item.tailoringJob && (
                      <div className="mt-2">
                        <TailoringStageBadge stage={item.tailoringJob.stage} />
                        <div className="mt-2">
                          <TailoringStageButton
                            jobId={item.tailoringJob.id}
                            currentStage={item.tailoringJob.stage}
                            onAdvance={advanceStage}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-semibold tabular-nums text-gray-900">
                    {formatPKR(item.lineTotalMinor)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="text-sm font-semibold text-gray-900">Total</span>
              <span className="text-base font-bold tabular-nums text-gray-900">{formatPKR(order.totalMinor)}</span>
            </div>
          </Card>

          <Card title="Payments">
            {order.payments.length === 0 ? (
              <p className="text-xs text-gray-400">No payments recorded.</p>
            ) : (
              <div className="space-y-3">
                {order.payments.map((payment) => (
                  <div key={payment.id} id={`payment-${payment.id}`} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                    <div>
                      <p className="text-xs font-medium text-gray-900">
                        {payment.type} · {payment.method.replace(/_/g, " ")}
                      </p>
                      {payment.senderName && <p className="text-xs text-gray-400">From: {payment.senderName}</p>}
                      {payment.collectedAt && (
                        <p className="text-xs text-gray-400">{formatDate(payment.collectedAt.toISOString())}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums text-gray-900">{formatPKR(payment.amountMinor)}</p>
                      <PaymentStatusBadge status={payment.status as never} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Activity">
            {order.events.length === 0 ? (
              <p className="text-xs text-gray-400">No events yet.</p>
            ) : (
              <ol className="space-y-3">
                {order.events.map((event) => (
                  <li key={event.id} className="flex items-start gap-3 text-xs">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 font-mono text-[10px]">
                      {event.type.charAt(0)}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-700">{event.type.replace(/_/g, " ")}</p>
                      {event.note && <p className="text-gray-400">{event.note}</p>}
                      <p className="text-gray-300 mt-0.5">{formatDate(event.createdAt.toISOString())}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Customer">
            <p className="text-sm font-medium text-gray-900">{order.customer.name ?? "—"}</p>
            <a href={`tel:${order.customer.phone}`} className="mt-1 block text-xs text-gray-500 hover:text-gray-700">
              {order.customer.phone}
            </a>
            <a
              href={`https://wa.me/${order.customer.phone}?text=${encodeURIComponent(`Order ref: ${order.orderRef}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#25D366] hover:underline"
            >
              Open WhatsApp
            </a>
          </Card>

          <Card title="Details">
            <dl className="space-y-2 text-xs">
              <Row label="Channel" value={order.channel} />
              <Row label="Source" value={order.source} />
              <Row label="Fulfillment" value={order.fulfillmentType.replace(/_/g, " ")} />
              <Row
                label="WhatsApp confirmed"
                value={order.confirmedViaWhatsapp ? "Yes" : "No"}
              />
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-gray-400">{label}</dt>
      <dd className="font-medium text-gray-700">{value}</dd>
    </div>
  );
}
