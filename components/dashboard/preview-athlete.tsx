"use client";

import {
  Activity,
  HeartPulse,
  Moon,
  Sparkles,
  TrendingUp,
  Zap
} from "lucide-react";
import { BrowserFrame } from "./browser-frame";
import { KpiTile } from "./kpi-tile";

const loadBars = [55, 30, 80, 25, 92, 40, 70];

/** Athlete dashboard mini-preview — mirrors /dashboard visual language. */
export function PreviewAthlete() {
  return (
    <BrowserFrame path="fitconnect.app / dashboard">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-1 rounded-2xl border border-ink-800 bg-ink-950/60 p-4 flex flex-col items-center">
          <p className="text-[10px] uppercase tracking-widest text-ink-500">
            Readiness
          </p>
          <svg
            viewBox="0 0 80 80"
            className="my-2 h-24 w-24 -rotate-90"
            aria-hidden
          >
            <circle
              cx="40"
              cy="40"
              r="32"
              fill="transparent"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="7"
            />
            <circle
              cx="40"
              cy="40"
              r="32"
              fill="transparent"
              stroke="url(#previewAthleteRing)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 32}
              strokeDashoffset={2 * Math.PI * 32 * 0.18}
            />
            <defs>
              <linearGradient
                id="previewAthleteRing"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#84cc16" />
              </linearGradient>
            </defs>
          </svg>
          <p className="font-display text-3xl font-bold gradient-text">82</p>
          <p className="text-[11px] text-accent-400 mt-1 flex items-center gap-1">
            <Zap className="h-3 w-3" aria-hidden /> Train hard
          </p>
        </div>

        <div className="sm:col-span-2 grid grid-cols-2 gap-3">
          <KpiTile
            icon={HeartPulse}
            iconClassName="text-signal-400"
            label="HRV"
            value="68 ms"
            delta="+4"
          />
          <KpiTile
            icon={Moon}
            iconClassName="text-brand-300"
            label="Sleep"
            value="7h 42m"
            delta="89%"
          />
          <KpiTile
            icon={Activity}
            iconClassName="text-accent-400"
            label="Load (7d)"
            value="6,420"
            delta="optimal"
          />
          <KpiTile
            icon={TrendingUp}
            iconClassName="text-plasma-400"
            label="VO₂max"
            value="52.4"
            delta="+1.2"
          />
        </div>

        <div className="sm:col-span-3 rounded-2xl border border-ink-800 bg-ink-950/60 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-ink-100">7-day load</p>
            <span className="text-[10px] uppercase tracking-widest text-accent-400 font-semibold">
              Polarised · 80/20
            </span>
          </div>
          <div className="flex items-end gap-2 h-24" role="img" aria-label="Weekly training load chart">
            {loadBars.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-md bg-gradient-to-t from-brand-500 to-accent-500"
                style={{ height: `${h}%`, opacity: 0.6 + i * 0.05 }}
              />
            ))}
          </div>
        </div>

        <div className="sm:col-span-3 rounded-2xl border border-plasma-500/30 bg-plasma-500/5 p-4 flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-plasma-500/10 text-plasma-400 shrink-0">
            <Sparkles className="h-4 w-4" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-100">
              AI suggestion · move tomorrow&apos;s threshold to Thursday
            </p>
            <p className="text-xs text-ink-400 mt-1">
              HRV down 8 ms, sleep efficiency 76%. Diego has been notified.
            </p>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}
