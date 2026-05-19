"use client";

import {
  MetricTile,
  PremiumCard,
  RealtimeBadge
} from "@/components/ui-glass/premium-system";

export function HeroMetricsDeferred() {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3 max-w-2xl lg:max-w-none">
        <MetricTile label="Readiness" value="82" delta="+4 HRV" tone="volt" />
        <MetricTile label="Coach fit" value="97%" delta="verified" tone="brand" />
        <MetricTile label="Load" value="68%" delta="live" tone="brand" />
      </div>
      <PremiumCard tone="brand" className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="font-display text-sm font-bold text-ink-50">
            FitConnect becomes your training operating system.
          </p>
          <p className="mt-1 text-xs text-ink-400">
            Coach marketplace, wearable intelligence and live feedback in one flow.
          </p>
        </div>
        <RealtimeBadge>Live demo</RealtimeBadge>
      </PremiumCard>
    </>
  );
}
