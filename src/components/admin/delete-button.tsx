"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

interface DeleteButtonProps {
  id: string;
  action: (id: string) => Promise<{ error?: string } | void>;
  confirmMessage?: string;
  disabled?: boolean;
  className?: string;
}

export function DeleteButton({ id, action, disabled, className }: DeleteButtonProps) {
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm) {
      setConfirm(true);
      setTimeout(() => setConfirm(false), 4000);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await action(id);
      if (result && "error" in result && result.error) {
        setError(result.error);
        setConfirm(false);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isPending}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors",
          confirm ? "bg-red-500 text-white hover:bg-red-600" : "text-red-500 hover:bg-red-50",
          "disabled:pointer-events-none disabled:opacity-40",
          className
        )}
      >
        {isPending ? "Deleting…" : confirm ? "Confirm delete?" : "Delete"}
      </button>
      {error && <p className="text-[10px] text-red-600 max-w-[180px]">{error}</p>}
    </div>
  );
}
