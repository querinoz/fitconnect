"use client";

import { ReadinessRing } from "@/components/ui-glass/readiness-ring";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

type ReadinessCardFullProps = {
  readiness: number;
  hrv: number;
  baselineHrv: number;
  sleepHours: string;
  sleepQuality?: string;
};

function parseSleepHours(raw: string): number {
  const match = raw.match(/([\d.]+)/);
  return match ? Number.parseFloat(match[1]!) : 7.5;
}

export function ReadinessCardFull({
  readiness,
  hrv,
  baselineHrv,
  sleepHours,
  sleepQuality = "Good quality"
}: ReadinessCardFullProps) {
  const sleep = parseSleepHours(sleepHours);
  const diff = hrv - baselineHrv;
  const band =
    readiness >= 75 ? "Train hard" : readiness >= 50 ? "Moderate effort" : "Recovery day";
  const bandColor =
    readiness >= 75
      ? "text-lime-400"
      : readiness >= 50
        ? "text-brand-400"
        : "text-signal-500";
  const bandBg =
    readiness >= 75
      ? "bg-lime-500/12 border-lime-500/25"
      : readiness >= 50
        ? "bg-brand-400/12 border-brand-400/25"
        : "bg-signal-500/12 border-signal-500/25";

  const TrendIcon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
  const trendColor = diff > 0 ? "text-lime-400" : diff < 0 ? "text-signal-500" : "text-ink-500";

  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-500">
            Today&apos;s readiness
          </p>
          <div className={`inline-flex items-center gap-2 rounded-xl border ${bandBg} px-3 py-1.5`}>
            <span className={`font-display text-sm font-bold ${bandColor}`}>{band}</span>
          </div>
          <p className="mt-2 text-xs text-ink-500">Based on HRV, sleep, and training load</p>
        </div>
        <ReadinessRing percent={readiness} label="Ready" size={96} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-ink-800/80 bg-ink-950/50 p-3.5">
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-ink-500">HRV</p>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-xl font-bold text-ink-100">{hrv}</span>
            <span className="text-xs text-ink-500">ms</span>
          </div>
          <div className={`mt-1 flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="h-3 w-3" />
            <span className="text-[10px] font-medium">
              {diff >= 0 ? "+" : ""}
              {diff} vs avg
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-ink-800/80 bg-ink-950/50 p-3.5">
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-ink-500">
            Sleep
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-xl font-bold text-ink-100">{sleep}</span>
            <span className="text-xs text-ink-500">h</span>
          </div>
          <p className="mt-1 text-[10px] font-medium text-lime-400">{sleepQuality}</p>
        </div>
        <div className="rounded-xl border border-ink-800/80 bg-ink-950/50 p-3.5">
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-ink-500">
            30d avg
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-xl font-bold text-ink-100">{baselineHrv}</span>
            <span className="text-xs text-ink-500">ms</span>
          </div>
          <p className="mt-1 text-[10px] text-ink-500">HRV baseline</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-ink-800/60 pt-4">
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-400" />
        <span className="text-[10px] text-ink-500">Synced from Apple Watch · 14 min ago</span>
        <a
          href="/settings/wearables"
          className="ml-auto text-[10px] font-medium text-brand-400 transition-colors hover:text-brand-300"
        >
          Manage wearables
        </a>
      </div>
    </div>
  );
}
