"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Cheap near-real-time updates without extra infrastructure: re-fetch the
 * current server components on an interval so new storefront enquiries and
 * orders surface without a manual refresh. Pauses while the tab is hidden to
 * avoid wasting database reads.
 */
export function LiveRefresh({ intervalMs = 60_000 }: { intervalMs?: number }) {
  const router = useRouter();
  const [live, setLive] = useState(true);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    const start = () => {
      stop();
      timer = setInterval(() => {
        if (document.visibilityState === "visible") router.refresh();
      }, intervalMs);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
    };
    const onVisibility = () => {
      const visible = document.visibilityState === "visible";
      setLive(visible);
      if (visible) router.refresh();
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [router, intervalMs]);

  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-400" title="Auto-updating">
      <span className={`h-1.5 w-1.5 rounded-full ${live ? "animate-pulse bg-emerald-500" : "bg-gray-300"}`} aria-hidden="true" />
      {live ? "Live" : "Paused"}
    </span>
  );
}
