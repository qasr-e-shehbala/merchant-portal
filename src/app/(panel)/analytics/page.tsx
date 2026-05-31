import type { Metadata } from "next";
import { getAnalyticsSummary } from "@/server/analytics/queries";
import { formatDate } from "@/lib/utils";
import { TrendingUp, MessageSquare, Eye, Users } from "lucide-react";

export const metadata: Metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const data = await getAnalyticsSummary();

  const KPI = [
    { label: "Total Leads", value: data.totalLeads, icon: Users, sub: `${data.leadsToday} today` },
    { label: "WhatsApp Clicks", value: data.totalWhatsAppClicks, icon: MessageSquare, sub: "All time" },
    { label: "Product Views", value: data.totalPageViews, icon: Eye, sub: "Beacon events" },
    { label: "Leads Today", value: data.leadsToday, icon: TrendingUp, sub: "Since midnight" },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        These numbers come from the server-side beacon and lead table — not GA4. Link Google Search Console for organic search data, and GA4 for full session analytics.
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {KPI.map(({ label, value, icon: Icon, sub }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-500">{label}</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-jewel/10">
                <Icon className="h-4 w-4 text-jewel" aria-hidden="true" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold tabular-nums text-gray-900">{value.toLocaleString()}</p>
            <p className="mt-1 text-xs text-gray-400">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Events (last 7 days)</h2>
          {data.topEventTypes.length === 0 ? (
            <p className="text-xs text-gray-400">No events recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {data.topEventTypes.map(({ eventType, count }) => {
                const max = data.topEventTypes[0]?.count ?? 1;
                return (
                  <div key={eventType}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs text-gray-600">{eventType.replace(/_/g, " ")}</span>
                      <span className="text-xs font-medium tabular-nums text-gray-900">{count}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-royal to-jewel"
                        style={{ width: `${(count / max) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Leads by Source</h2>
          {data.leadsBySource.length === 0 ? (
            <p className="text-xs text-gray-400">No leads yet.</p>
          ) : (
            <div className="space-y-3">
              {data.leadsBySource.map(({ source, count }) => {
                const total = data.leadsBySource.reduce((s, x) => s + x.count, 0);
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={source} className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{source.replace(/_/g, " ")}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{pct}%</span>
                      <span className="text-xs font-medium tabular-nums text-gray-900">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Recent Leads</h2>
        {data.recentLeads.length === 0 ? (
          <p className="text-xs text-gray-400">No leads yet.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {data.recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between py-2.5">
                <div>
                  <span className="font-mono text-xs font-semibold text-jewel">{lead.ref}</span>
                  <span className="ml-2 text-xs text-gray-500">{lead.phone}</span>
                  {lead.city && <span className="ml-1 text-xs text-gray-400">· {lead.city}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{lead.source.replace(/_/g, " ")}</span>
                  <time className="text-xs text-gray-400">{formatDate(lead.createdAt)}</time>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
