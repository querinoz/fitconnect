"use client";

import type { ReactNode } from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type ReadinessCardFullProps = {
  readiness: number;
  hrv: number;
  baselineHrv: number;
  sleepHours: string;
  sleepQuality?: string;
  headerAction?: ReactNode;
};

/** Semicircle gauge — padding includes stroke so caps are never clipped. */
export const READINESS_GAUGE = {
  width: 240,
  height: 152,
  cx: 120,
  cy: 124,
  r: 100,
  stroke: 10
} as const;

function clampScore(score: number) {
  return Math.min(100, Math.max(0, score));
}

export function readinessTrackPath(
  g: Pick<typeof READINESS_GAUGE, "cx" | "cy" | "r"> = READINESS_GAUGE
) {
  return `M${g.cx - g.r},${g.cy} A${g.r},${g.r} 0 0,1 ${g.cx + g.r},${g.cy}`;
}

export function readinessArcPath(
  score: number,
  g: Pick<typeof READINESS_GAUGE, "cx" | "cy" | "r"> = READINESS_GAUGE
) {
  const pct = clampScore(score) / 100;
  const angle = 180 * pct;
  const rad = ((180 - angle) * Math.PI) / 180;
  const x = g.cx + g.r * Math.cos(rad);
  const y = g.cy - g.r * Math.sin(rad);
  const large = angle > 90 ? 1 : 0;
  return `M${g.cx - g.r},${g.cy} A${g.r},${g.r} 0 ${large},1 ${x},${y}`;
}

function parseSleepHours(raw: string): number {
  const match = raw.match(/([\d.]+)/);
  return match ? Number.parseFloat(match[1]!) : 7.5;
}

export function ReadinessCardFull({
  readiness,
  hrv,
  baselineHrv,
  sleepHours,
  sleepQuality = "Good quality",
  headerAction
}: ReadinessCardFullProps) {
  const sleep = parseSleepHours(sleepHours);
  const diff = hrv - baselineHrv;
  const band =
    readiness >= 75
      ? "Optimal · Intense training recommended"
      : readiness >= 50
        ? "Moderate · Steady effort"
        : "Recovery · Rest prioritized";

  const TrendIcon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
  const trendColor =
    diff > 0 ? "text-eos-performance" : diff < 0 ? "text-eos-alert" : "text-eos-on-surface-subtle";

  return (
    <div className="fc-readiness-card relative min-w-0 overflow-hidden rounded-[14px] border border-eos-outline bg-carbon-2 p-5 sm:p-6">
      <div
        className="pointer-events-none absolute left-1/2 top-8 h-40 w-56 -translate-x-1/2 bg-[radial-gradient(circle,color-mix(in_srgb,var(--eos-voltline)_12%,transparent)_0%,transparent_70%)]"
        aria-hidden
      />

      <div
        className={cn(
          "relative mb-2 grid items-center gap-2",
          headerAction
            ? "grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]"
            : "grid-cols-1"
        )}
      >
        <p
          className={cn(
            "min-w-0 text-[9px] font-bold uppercase tracking-[0.26em] text-eos-on-surface-subtle",
            headerAction
              ? "text-left sm:col-start-2 sm:justify-self-center sm:text-center"
              : "text-center"
          )}
        >
          AI Readiness · Today
        </p>
        {headerAction ? (
          <div className="col-start-2 justify-self-end sm:col-start-3">{headerAction}</div>
        ) : null}
      </div>

      <div
        data-testid="readiness-gauge"
        className="relative mx-auto w-full max-w-[16.5rem]"
        style={{ aspectRatio: `${READINESS_GAUGE.width} / ${READINESS_GAUGE.height}` }}
      >
        <svg
          viewBox={`0 0 ${READINESS_GAUGE.width} ${READINESS_GAUGE.height}`}
          className="absolute inset-0 h-full w-full overflow-visible"
          aria-hidden
        >
          <path
            d={readinessTrackPath()}
            fill="none"
            stroke="color-mix(in srgb, var(--eos-on-surface) 10%, transparent)"
            strokeWidth={READINESS_GAUGE.stroke}
            strokeLinecap="round"
          />
          <path
            d={readinessArcPath(readiness)}
            fill="none"
            stroke="var(--eos-voltline)"
            strokeWidth={READINESS_GAUGE.stroke}
            strokeLinecap="round"
            className="fc-motion-data"
          />
        </svg>
        <div className="absolute inset-x-0 bottom-[12%] flex flex-col items-center justify-end">
          <span
            data-testid="readiness-score"
            className="font-display text-[3.15rem] font-extrabold leading-none tracking-[-0.06em] text-eos-voltline tabular-nums sm:text-[3.35rem]"
            style={{ textShadow: "0 0 40px color-mix(in srgb, var(--eos-voltline) 28%, transparent)" }}
          >
            {Math.round(clampScore(readiness))}
          </span>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-eos-on-surface-subtle">
            Readiness
          </p>
        </div>
      </div>

      <div className="mb-5 mt-3 flex justify-center px-1">
        <span className="inline-flex max-w-full text-balance rounded-full border border-eos-voltline/20 bg-volt-dim px-3 py-1.5 text-center text-[10px] font-bold uppercase leading-snug tracking-[0.08em] text-eos-voltline">
          {band}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="min-w-0 rounded-lg border border-eos-outline bg-carbon-3 p-2.5 text-center">
          <div className="font-display text-lg font-extrabold leading-none tabular-nums text-eos-connect">
            {hrv}
          </div>
          <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-eos-on-surface-subtle">
            HRV ms
          </div>
          <div className={`mt-1 flex items-center justify-center gap-0.5 ${trendColor}`}>
            <TrendIcon className="h-3 w-3" />
            <span className="text-[9px] font-medium tabular-nums">
              {diff >= 0 ? "+" : ""}
              {diff}
            </span>
          </div>
        </div>
        <div className="min-w-0 rounded-lg border border-eos-outline bg-carbon-3 p-2.5 text-center">
          <div className="font-display text-lg font-extrabold leading-none tabular-nums text-eos-telemetry">
            {sleep}
          </div>
          <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-eos-on-surface-subtle">
            Sleep h
          </div>
          <p className="mt-1 truncate text-[9px] font-medium text-eos-performance">{sleepQuality}</p>
        </div>
        <div className="min-w-0 rounded-lg border border-eos-outline bg-carbon-3 p-2.5 text-center">
          <div className="font-display text-lg font-extrabold leading-none tabular-nums text-eos-performance">
            {baselineHrv}
          </div>
          <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-eos-on-surface-subtle">
            30d avg
          </div>
          <p className="mt-1 truncate text-[9px] text-eos-on-surface-subtle">HRV baseline</p>
        </div>
      </div>

      <div className="mt-4 flex min-w-0 flex-wrap items-center gap-2 border-t border-eos-outline pt-4">
        <div className="h-1.5 w-1.5 shrink-0 animate-volt-pulse rounded-full bg-eos-voltline" />
        <span className="min-w-0 text-[10px] text-eos-on-surface-subtle">
          Synced from wearables · recently
        </span>
        <a
          href="/settings/wearables"
          className="ml-auto shrink-0 text-[10px] font-semibold text-eos-connect transition-colors hover:text-eos-voltline"
        >
          Manage wearables
        </a>
      </div>
    </div>
  );
}
