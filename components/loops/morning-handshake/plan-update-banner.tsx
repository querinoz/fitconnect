"use client";

import { GlassCard } from "@/components/ui-glass/glass-card";
import { VoltButton } from "@/components/ui-glass/volt-button";

const LABELS = {
  "lighter-day": "Lighter day",
  "swap-z2": "Swap to Z2",
  "add-recovery": "Add recovery",
  custom: "Plan update"
} as const;

export type PlanUpdateBannerDiff = keyof typeof LABELS;

export function PlanUpdateBanner({
  coachName,
  diff,
  onApply,
  onDismiss
}: {
  coachName: string;
  diff: PlanUpdateBannerDiff;
  onApply: () => void;
  onDismiss: () => void;
}) {
  return (
    <GlassCard tone="live" className="flex items-center gap-3 flex-wrap">
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-[0.18em] text-volt-500">
          {coachName} updated today
        </p>
        <p className="font-semibold">{LABELS[diff] ?? "Plan update"}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-sm text-ink-300 hover:text-ink-100"
      >
        Keep
      </button>
      <VoltButton type="button" onClick={onApply}>
        Apply
      </VoltButton>
    </GlassCard>
  );
}
