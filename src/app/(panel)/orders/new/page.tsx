import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OrderForm } from "@/components/admin/order-form";
import { createWalkInOrderAction } from "@/server/orders/order-actions";

export const metadata: Metadata = { title: "New Order" };
export const dynamic = "force-dynamic";

export default function NewOrderPage() {
  return (
    <div className="space-y-5">
      <div>
        <Link href="/orders" className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to orders
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">New Walk-in Order</h1>
        <p className="mt-1 text-sm text-gray-500">
          Record an in-store order. The customer is matched or created by phone number.
        </p>
      </div>

      <OrderForm action={createWalkInOrderAction} />
    </div>
  );
}
