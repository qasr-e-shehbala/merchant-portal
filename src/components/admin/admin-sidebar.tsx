"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Palette,
  Shirt,
  Scissors,
  Package,
  Users,
  Ruler,
  CalendarDays,
  MessageSquare,
  BarChart2,
  UserCog,
  FileText,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/server/auth/actions";

const NAV = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Orders", href: "/orders", icon: ShoppingBag },
  { label: "Products", href: "/products", icon: Shirt },
  { label: "Categories", href: "/categories", icon: Layers },
  { label: "Fabrics", href: "/fabrics", icon: Palette },
  { label: "Tailoring", href: "/tailoring", icon: Scissors },
  { label: "Inventory", href: "/inventory", icon: Package },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Measurements", href: "/measurements", icon: Ruler },
  { label: "Appointments", href: "/appointments", icon: CalendarDays },
  { label: "Leads", href: "/leads", icon: MessageSquare },
  { label: "Analytics", href: "/analytics", icon: BarChart2 },
  { label: "Staff", href: "/staff", icon: UserCog },
  { label: "Blog", href: "/blog", icon: FileText },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-gray-200 bg-white lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-200 px-5">
        <div>
          <p className="text-sm font-bold text-gray-900" style={{ fontFamily: "Georgia, serif" }}>
            Qasar-e-Shehbala
          </p>
          <p className="text-[10px] text-[#c9a227] uppercase tracking-wider">Admin Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin navigation">
        <ul className="space-y-0.5">
          {NAV.map(({ label, href, icon: Icon }) => {
            // Active if exact match for dashboard, prefix match for others
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-amber-50 text-[#c9a227]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sign out */}
      <div className="border-t border-gray-200 p-3">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
