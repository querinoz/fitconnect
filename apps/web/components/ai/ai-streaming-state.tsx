"use client";

import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type AIStreamingStateProps = {
  label: string;
  className?: string;
};

/**
 * Honest waiting indicator — not fake token streaming.
 * Reduced motion: static dots, no pulse loop.
 */
export function AIStreamingState({ label, className }: AIStreamingStateProps) {
  const reduce = useReducedMotion();
  return (
    <div
      data-testid="ai-streaming-state"
      role="status"
      aria-live="polite"
      className={cn(
        "mr-auto inline-flex items-center gap-2 rounded-2xl bg-eos-elevated/80 px-3.5 py-2.5 ring-1 ring-eos-outline",
        className
      )}
    >
      <span className="flex gap-1" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 w-1.5 rounded-full bg-eos-telemetry",
              !reduce && "animate-pulse"
            )}
            style={!reduce ? { animationDelay: `${i * 120}ms` } : undefined}
          />
        ))}
      </span>
      <span className="text-[11px] text-eos-on-surface-subtle">{label}</span>
    </div>
  );
}
