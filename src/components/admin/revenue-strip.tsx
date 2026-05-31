import { Wallet, CalendarRange, ShoppingBag, Store } from "lucide-react";
import { formatPKR } from "@/lib/utils";
import { getRevenueStats } from "@/server/orders/queries";

export async function RevenueStrip() {
  const r = await getRevenueStats();

  const cards = [
    {
      label: "Collected today",
      value: formatPKR(BigInt(r.collectedTodayMinor)),
      subLabel: "verified payments",
      icon: <Wallet className="h-5 w-5 text-emerald-600" aria-hidden="true" />,
    },
    {
      label: "Collected this month",
      value: formatPKR(BigInt(r.collectedMonthMinor)),
      subLabel: "cash + transfers",
      icon: <CalendarRange className="h-5 w-5 text-[#c9a227]" aria-hidden="true" />,
    },
    {
      label: "Order value (month)",
      value: formatPKR(BigInt(r.orderValueMonthMinor)),
      subLabel: `${r.ordersThisMonth} orders booked`,
      icon: <ShoppingBag className="h-5 w-5 text-blue-500" aria-hidden="true" />,
    },
    {
      label: "Walk-in / online",
      value: `${r.walkInsThisMonth} / ${r.onlineThisMonth}`,
      subLabel: "orders this month",
      icon: <Store className="h-5 w-5 text-purple-500" aria-hidden="true" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">{card.label}</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50">{card.icon}</div>
          </div>
          <p className="mt-3 text-xl font-bold tabular-nums text-gray-900">{card.value}</p>
          <p className="mt-1 text-xs text-gray-400">{card.subLabel}</p>
        </div>
      ))}
    </div>
  );
}
