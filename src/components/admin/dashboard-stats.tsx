// Server component — reads from the DB and renders KPI cards.
// In Phase 1 returns zeros; wire up Prisma queries in each function.

import { ShoppingBag, Scissors, Clock, TrendingUp } from "lucide-react";
import { getDashboardStats } from "@/server/orders/queries";

interface Stat {
  label: string;
  value: string;
  subLabel?: string;
  icon: React.ReactNode;
}

export async function DashboardStats() {
  const stats = await getDashboardStats();

  const STATS: Stat[] = [
    {
      label: "New Leads Today",
      value: String(stats.newLeadsToday),
      subLabel: "via WhatsApp / web",
      icon: <TrendingUp className="h-5 w-5 text-[#c9a227]" aria-hidden="true" />,
    },
    {
      label: "Open Orders",
      value: String(stats.openOrders),
      subLabel: "confirmed or in progress",
      icon: <ShoppingBag className="h-5 w-5 text-blue-500" aria-hidden="true" />,
    },
    {
      label: "Pending Payments",
      value: String(stats.pendingVerifications),
      subLabel: "screenshots to verify",
      icon: <Clock className="h-5 w-5 text-orange-500" aria-hidden="true" />,
    },
    {
      label: "Active Tailoring Jobs",
      value: String(stats.activeJobs),
      subLabel: "in production",
      icon: <Scissors className="h-5 w-5 text-purple-500" aria-hidden="true" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-gray-200 bg-white p-5"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">{stat.label}</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50">
              {stat.icon}
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900 tabular-nums">
            {stat.value}
          </p>
          {stat.subLabel && (
            <p className="mt-1 text-xs text-gray-400">{stat.subLabel}</p>
          )}
        </div>
      ))}
    </div>
  );
}
