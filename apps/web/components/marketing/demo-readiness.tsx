"use client";

import { HeartRateIcon, RecoveryRingIcon } from "@/components/brand/icons";
import { Moon, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Readiness demo — a looping ring fill (51 → 226 stroke-dashoffset)
 * paired with a stat row whose values morph in step with the ring.
 *
 * Pure CSS. Ring uses the .fc-ring-loop animation. Stat row uses
 * fc-tick-flip for the two-state morph.
 */
export function DemoReadiness({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-ink-800 bg-ink-950/70 p-6 relative overflow-hidden",
        className
      )}
    >
      <Glow />
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-500/10 text-accent-400 ring-1 ring-accent-500/30">
          <RecoveryRingIcon className="h-4 w-4" />
        </span>
        <p className="text-[10px] uppercase tracking-widest text-accent-400 font-bold">
          Readiness
        </p>
      </div>

      <div className="mt-5 flex items-center gap-5">
        <div className="relative h-[120px] w-[120px] shrink-0">
          <svg
            viewBox="0 0 80 80"
            className="absolute inset-0 -rotate-90 h-full w-full"
            aria-hidden="true"
          >
            <circle
              cx="40"
              cy="40"
              r="32"
              fill="transparent"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="8"
            />
            <circle
              cx="40"
              cy="40"
              r="32"
              fill="transparent"
              stroke="url(#fcDemoRing)"
              strokeWidth="8"
              strokeLinecap="round"
              className="fc-ring-loop"
            />
            <defs>
              <linearGradient id="fcDemoRing" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#84cc16" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-display text-3xl font-bold tabular-nums gradient-text">
              82
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          <Stat
            icon={Moon}
            label="Sleep"
            base="6h 24m"
            target="7h 42m"
            tone="brand"
          />
          <Stat
            icon={HeartRateIcon}
            label="HRV"
            base="58 ms"
            target="68 ms"
            tone="signal"
          />
          <Stat
            icon={Zap}
            label="Verdict"
            base="Easy day"
            target="Train hard"
            tone="accent"
          />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 text-[11px] text-ink-400">
        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-accent-400 animate-pulse" />
        Auto-synced from Apple Watch · Garmin · Whoop
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  base,
  target,
  tone
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  base: string;
  target: string;
  tone: "brand" | "signal" | "accent";
}) {
  const toneClasses = {
    brand: "bg-brand-500/10 text-brand-300 ring-brand-500/30",
    signal: "bg-signal-500/10 text-signal-400 ring-signal-500/30",
    accent: "bg-accent-500/10 text-accent-400 ring-accent-500/30"
  } as const;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-ink-800 bg-ink-950/60 px-3 py-2">
      <span
        className={cn(
          "grid h-7 w-7 place-items-center rounded-lg ring-1",
          toneClasses[tone]
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <p className="text-[10px] uppercase tracking-widest text-ink-500">
        {label}
      </p>
      <span className="ml-auto relative inline-block h-[1.2em] overflow-hidden text-sm font-display font-semibold text-ink-50 tabular-nums">
        <span className="block fc-tick-flip">
          <span className="block">{base}</span>
          <span className="block">{target}</span>
        </span>
      </span>
    </div>
  );
}

function Glow() {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-brand-500/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-accent-500/15 blur-3xl"
      />
    </>
  );
}
