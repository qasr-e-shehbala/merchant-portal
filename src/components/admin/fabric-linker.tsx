"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { linkFabricAction, unlinkFabricAction } from "@/server/catalog/product-mutations-extended";

interface Fabric {
  id: string;
  name: string;
  code: string;
  color: string | null;
}

interface FabricLinkerProps {
  productId: string;
  allFabrics: Fabric[];
  linkedFabricIds: string[];
}

export function FabricLinker({ productId, allFabrics, linkedFabricIds }: FabricLinkerProps) {
  const [linked, setLinked] = useState(new Set(linkedFabricIds));
  const [isPending, startTransition] = useTransition();

  function toggle(fabricId: string) {
    const isLinked = linked.has(fabricId);
    startTransition(async () => {
      if (isLinked) {
        await unlinkFabricAction(productId, fabricId);
        setLinked((prev) => { const n = new Set(prev); n.delete(fabricId); return n; });
      } else {
        await linkFabricAction(productId, fabricId);
        setLinked((prev) => new Set(prev).add(fabricId));
      }
    });
  }

  if (allFabrics.length === 0) {
    return (
      <p className="text-xs text-gray-400">
        No fabrics in the system yet.{" "}
        <a href="/fabrics/new" className="text-terracotta hover:underline">Add fabrics first.</a>
      </p>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-2", isPending && "opacity-60")}>
      {allFabrics.map((fabric) => {
        const isLinked = linked.has(fabric.id);
        return (
          <button
            key={fabric.id}
            type="button"
            onClick={() => toggle(fabric.id)}
            disabled={isPending}
            className={cn(
              "inline-flex flex-col items-start rounded-xl border px-3 py-2 text-left transition-all",
              isLinked
                ? "border-terracotta/30 bg-terracotta-pale text-terracotta"
                : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
            )}
          >
            <span className="text-xs font-medium">{fabric.name}</span>
            <span className="text-[10px] opacity-60">{fabric.code}{fabric.color ? ` · ${fabric.color}` : ""}</span>
          </button>
        );
      })}
    </div>
  );
}
