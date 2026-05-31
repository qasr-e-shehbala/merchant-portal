"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/orders": "Orders",
  "/tailoring": "Tailoring Jobs",
  "/inventory": "Inventory",
  "/customers": "Customers",
  "/measurements": "Measurements",
  "/appointments": "Appointments",
  "/leads": "WhatsApp Leads",
  "/analytics": "Analytics",
  "/staff": "Staff",
  "/blog": "Blog & CMS",
};

interface AdminHeaderProps {
  staffName: string;
  role: string;
}

export function AdminHeader({ staffName, role }: AdminHeaderProps) {
  const pathname = usePathname();
  const title =
    Object.entries(PAGE_TITLES)
      .filter(([key]) => pathname.startsWith(key))
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ?? "Admin";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
      <h1 className="text-base font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium text-gray-900">{staffName}</p>
            <p className="text-[10px] uppercase tracking-wide text-gray-400">{role}</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-[#c9a227]">
            {staffName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
