"use client";

import {
  MetricTile,
  PremiumCard,
  RealtimeBadge
} from "@/components/ui-glass/premium-system";
import { useLocale } from "@/lib/i18n-provider";

export function HeroMetricsDeferred() {
  const x = useLocale().heroExtras;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3 max-w-2xl lg:max-w-none">
        <MetricTile label={x.metricsReadiness} value="82" delta={x.metricsReadinessDelta} tone="volt" />
        <MetricTile label={x.metricsCoachFit} value="97%" delta={x.metricsCoachFitDelta} tone="brand" />
        <MetricTile label={x.metricsLoad} value="68%" delta={x.metricsLoadDelta} tone="brand" />
      </div>
      <PremiumCard tone="brand" className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="font-display text-sm font-bold text-ink-50">{x.cardTitle}</p>
          <p className="mt-1 text-xs text-ink-400">{x.cardBody}</p>
        </div>
        <RealtimeBadge>{x.liveDemo}</RealtimeBadge>
      </PremiumCard>
    </>
  );
}
