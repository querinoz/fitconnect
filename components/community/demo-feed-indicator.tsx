"use client";

import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";

export function DemoFeedIndicator({
  isLive,
  className
}: {
  isLive: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border border-volt-500/25 bg-glass-volt px-3 py-2",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={cn(
            "relative flex h-2 w-2 shrink-0",
            isLive && "animate-pulse"
          )}
        >
          <span
            className={cn(
              "absolute inline-flex h-full w-full rounded-full opacity-75",
              isLive ? "bg-volt-500 animate-ping" : "bg-ink-500"
            )}
          />
          <span
            className={cn(
              "relative inline-flex h-2 w-2 rounded-full",
              isLive ? "bg-volt-500" : "bg-ink-500"
            )}
          />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-volt-300">
            Demo Live Feed
          </p>
          <p className="text-[11px] text-ink-400 truncate">
            Simulated activity · fictional personas · not real users
          </p>
        </div>
      </div>
      <Radio className="h-4 w-4 shrink-0 text-volt-400" aria-hidden />
    </div>
  );
}
