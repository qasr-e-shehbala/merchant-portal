import { cn } from "@/lib/utils";

type OrderStatus =
  | "LEAD" | "CONFIRMED" | "IN_PROGRESS" | "READY"
  | "DISPATCHED" | "DELIVERED" | "CANCELLED" | "RTO";

type PaymentStatus =
  | "UNPAID" | "DEPOSIT_PAID" | "PARTIALLY_PAID" | "PAID" | "REFUNDED" | "COD_PENDING";

type TailoringStage =
  | "ENQUIRY" | "MEASURED" | "DEPOSIT_PAID" | "CUTTING" | "STITCHING"
  | "FITTING" | "REWORK" | "FINISHING" | "READY" | "DELIVERED" | "CANCELLED";

const ORDER_COLORS: Record<OrderStatus, string> = {
  LEAD:         "bg-gray-100 text-gray-700",
  CONFIRMED:    "bg-blue-50 text-blue-700",
  IN_PROGRESS:  "bg-amber-50 text-amber-700",
  READY:        "bg-emerald-50 text-emerald-700",
  DISPATCHED:   "bg-purple-50 text-purple-700",
  DELIVERED:    "bg-green-100 text-green-800",
  CANCELLED:    "bg-red-50 text-red-700",
  RTO:          "bg-red-100 text-red-800",
};

const PAYMENT_COLORS: Record<PaymentStatus, string> = {
  UNPAID:         "bg-red-50 text-red-700",
  DEPOSIT_PAID:   "bg-amber-50 text-amber-700",
  PARTIALLY_PAID: "bg-yellow-50 text-yellow-700",
  PAID:           "bg-green-50 text-green-700",
  REFUNDED:       "bg-gray-100 text-gray-700",
  COD_PENDING:    "bg-orange-50 text-orange-700",
};

const TAILORING_COLORS: Record<TailoringStage, string> = {
  ENQUIRY:      "bg-gray-100 text-gray-700",
  MEASURED:     "bg-blue-50 text-blue-700",
  DEPOSIT_PAID: "bg-amber-50 text-amber-700",
  CUTTING:      "bg-orange-50 text-orange-700",
  STITCHING:    "bg-purple-50 text-purple-700",
  FITTING:      "bg-indigo-50 text-indigo-700",
  REWORK:       "bg-red-50 text-red-600",
  FINISHING:    "bg-teal-50 text-teal-700",
  READY:        "bg-emerald-50 text-emerald-700",
  DELIVERED:    "bg-green-100 text-green-800",
  CANCELLED:    "bg-red-100 text-red-800",
};

function StatusBadge({
  label,
  colorClass,
}: {
  label: string;
  colorClass: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorClass
      )}
    >
      {label.replace(/_/g, " ")}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <StatusBadge
      label={status}
      colorClass={ORDER_COLORS[status] ?? "bg-gray-100 text-gray-700"}
    />
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <StatusBadge
      label={status}
      colorClass={PAYMENT_COLORS[status] ?? "bg-gray-100 text-gray-700"}
    />
  );
}

export function TailoringStageBadge({ stage }: { stage: TailoringStage }) {
  return (
    <StatusBadge
      label={stage}
      colorClass={TAILORING_COLORS[stage] ?? "bg-gray-100 text-gray-700"}
    />
  );
}
