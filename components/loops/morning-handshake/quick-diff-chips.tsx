"use client";

import type { PlanUpdate } from "@/lib/realtime/types";

const CHIPS: Array<{ key: PlanUpdate["diff"]; label: string }> = [
  { key: "lighter-day", label: "Lighter day" },
  { key: "swap-z2", label: "Swap to Z2" },
  { key: "add-recovery", label: "Add recovery" }
];

export function QuickDiffChips({
  onPick
}: {
  onPick: (k: PlanUpdate["diff"]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CHIPS.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={() => onPick(c.key)}
          aria-label={c.label}
          className="h-9 px-4 rounded-full bg-glass-md border border-glass-border text-sm font-semibold text-ink-100 hover:bg-glass-volt hover:border-volt-500/40"
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
