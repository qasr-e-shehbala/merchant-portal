import type { Metadata } from "next";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { RecentOrders } from "@/components/admin/recent-orders";
import { PendingPayments } from "@/components/admin/pending-payments";
import { ActiveTailoringJobs } from "@/components/admin/active-tailoring-jobs";

export const metadata: Metadata = { title: "Dashboard" };

// Real-time dashboard — no ISR, always dynamic
export const dynamic = "force-dynamic";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          {new Date().toLocaleDateString("en-PK", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* KPI cards */}
      <DashboardStats />

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Orders table — takes 2/3 width on xl */}
        <div className="xl:col-span-2 space-y-6">
          <RecentOrders />
        </div>

        {/* Sidebar panels */}
        <div className="space-y-6">
          <PendingPayments />
          <ActiveTailoringJobs />
        </div>
      </div>
    </div>
  );
}
