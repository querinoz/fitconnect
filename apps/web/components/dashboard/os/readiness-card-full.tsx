"use client";

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

function readinessArcPath(score: number) {
  const pct = Math.min(100, Math.max(0, score)) / 100;
  const angle = 180 * pct;
  const rad = ((180 - angle) * Math.PI) / 180;
  const cx = 100;
  const cy = 96;
  const r = 80;
  const x = cx + r * Math.cos(rad);
  const y = cy - r * Math.sin(rad);
  const large = angle > 90 ? 1 : 0;
  return `M20,96 A80,80 0 ${large},1 ${x},${y}`;
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
    readiness >= 75
      ? "Optimal · Intense training recommended"
      : readiness >= 50
        ? "Moderate · Steady effort"
        : "Recovery · Rest prioritized";

  const TrendIcon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
  const trendColor =
    diff > 0 ? "text-emerald-500" : diff < 0 ? "text-signal-500" : "text-ink-400";

  return (
    <div className="fc-readiness-card relative overflow-hidden rounded-[14px] border border-[var(--border-xs)] bg-carbon-2 p-6">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[200px] w-[280px] -translate-x-1/2 -translate-y-[60px] bg-[radial-gradient(circle,rgba(200,255,0,0.07)_0%,transparent_70%)]"
        aria-hidden
      />

      <p className="mb-2 text-center text-[9px] font-bold uppercase tracking-[0.26em] text-ink-400">
        AI Readiness · Today
      </p>

      <div className="relative mx-auto mb-1 flex flex-col items-center">
        <svg
          width="200"
          height="100"
          viewBox="0 0 200 100"
          className="-mb-5"
          aria-hidden
        >
          <path
            d="M20,96 A80,80 0 0,1 180,96"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d={readinessArcPath(readiness)}
            fill="none"
            stroke="var(--volt-500)"
            strokeWidth="8"
            strokeLinecap="round"
            className="fc-motion-data"
          />
        </svg>
        <div
          className="font-display text-[clamp(3.5rem,8vw,5.5rem)] font-extrabold leading-none tracking-[-0.06em] text-volt-500"
          style={{ textShadow: "0 0 48px rgba(200,255,0,0.22)" }}
        >
          {readiness}
        </div>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">
          Readiness
        </p>
      </div>

      <div className="mb-5 flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-volt-500/20 bg-volt-dim px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-volt-500">
          {band}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-[var(--border-xs)] bg-carbon-3 p-2.5 text-center">
          <div className="font-display text-lg font-extrabold leading-none text-connect-500">
            {hrv}
          </div>
          <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-400">
            HRV ms
          </div>
          <div className={`mt-1 flex items-center justify-center gap-0.5 ${trendColor}`}>
            <TrendIcon className="h-3 w-3" />
            <span className="text-[9px] font-medium">
              {diff >= 0 ? "+" : ""}
              {diff}
            </span>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--border-xs)] bg-carbon-3 p-2.5 text-center">
          <div className="font-display text-lg font-extrabold leading-none text-cyan-500">
            {sleep}
          </div>
          <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-400">
            Sleep h
          </div>
          <p className="mt-1 text-[9px] font-medium text-emerald-500">{sleepQuality}</p>
        </div>
        <div className="rounded-lg border border-[var(--border-xs)] bg-carbon-3 p-2.5 text-center">
          <div className="font-display text-lg font-extrabold leading-none text-emerald-500">
            {baselineHrv}
          </div>
          <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-400">
            30d avg
          </div>
          <p className="mt-1 text-[9px] text-ink-400">HRV baseline</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-[var(--border-xs)] pt-4">
        <div className="h-1.5 w-1.5 animate-volt-pulse rounded-full bg-volt-500" />
        <span className="text-[10px] text-ink-400">Synced from wearables · recently</span>
        <a
          href="/settings/wearables"
          className="ml-auto text-[10px] font-semibold text-connect-500 transition-colors hover:text-brand-300"
        >
          Manage wearables
        </a>
      </div>
    </div>
  );
}
