"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, Loader2 } from "lucide-react";

// Legal transitions only — the UI can never produce an invalid stage.
const NEXT_STAGES: Record<string, { label: string; value: string; urdu: string }[]> = {
  ENQUIRY:      [{ value: "MEASURED",     label: "Measurements Taken",  urdu: "ناپ لیا گیا" }],
  MEASURED:     [{ value: "DEPOSIT_PAID", label: "Deposit Received",    urdu: "ایڈوانس لیا" }],
  DEPOSIT_PAID: [{ value: "CUTTING",      label: "Cutting Started",     urdu: "کٹنگ شروع" }],
  CUTTING:      [{ value: "STITCHING",    label: "Stitching Started",   urdu: "سلائی شروع" }],
  STITCHING:    [{ value: "FITTING",      label: "Ready for Fitting",   urdu: "فٹنگ کے لیے تیار" }],
  FITTING: [
    { value: "REWORK",    label: "Needs Rework",      urdu: "دوبارہ کام" },
    { value: "FINISHING", label: "Fitting Approved",  urdu: "فٹنگ پاس" },
  ],
  REWORK:       [{ value: "FITTING",    label: "Back to Fitting",      urdu: "فٹنگ پر" }],
  FINISHING:    [{ value: "READY",      label: "Mark Ready",           urdu: "تیار" }],
  READY:        [{ value: "DELIVERED",  label: "Delivered / Collected", urdu: "دے دیا" }],
};

interface TailoringStageButtonProps {
  jobId: string;
  currentStage: string;
  onAdvance?: (jobId: string, newStage: string) => Promise<void>;
}

export function TailoringStageButton({
  jobId,
  currentStage,
  onAdvance,
}: TailoringStageButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState<string | null>(null);

  const options = NEXT_STAGES[currentStage] ?? [];

  if (options.length === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
        <CheckCircle className="h-4 w-4 text-emerald-500" aria-hidden="true" />
        {currentStage === "DELIVERED" ? "Completed" : "No next step"}
      </span>
    );
  }

  function advance(nextStage: string) {
    startTransition(async () => {
      await onAdvance?.(jobId, nextStage);
      setDone(nextStage);
    });
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
        <CheckCircle className="h-4 w-4" aria-hidden="true" />
        Updated to {done.replace(/_/g, " ")}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={isPending}
          onClick={() => advance(opt.value)}
          className={cn(
            "inline-flex flex-col items-center justify-center rounded-xl border",
            "min-w-[7rem] px-3 py-3 text-center transition-colors",
            "border-emerald-200 bg-emerald-50 text-emerald-800",
            "hover:bg-emerald-100 active:bg-emerald-200",
            "disabled:pointer-events-none disabled:opacity-50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          )}
          aria-label={`Advance to ${opt.label}`}
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <>
              <span className="text-sm font-semibold leading-tight">{opt.label}</span>
              <span className="mt-0.5 text-xs text-emerald-600 font-medium" dir="rtl" lang="ur">
                {opt.urdu}
              </span>
            </>
          )}
        </button>
      ))}
    </div>
  );
}
