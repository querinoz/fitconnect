"use client";

import { useEffect, useState } from "react";
import { Bell, MousePointer2, PlayCircle, Sparkles } from "lucide-react";
import {
  CalendarStreakIcon,
  HeartRateIcon,
  RecoveryRingIcon,
  StopwatchIcon
} from "@/components/brand/icons";
import { RiftBento, RiftLabel, RiftScore } from "@/components/ui-glass/rift-bento";
import { cn } from "@/lib/utils";

const loadBars = [55, 18, 80, 25, 92, 30, 70];

/**
 * Animated product mockup — Rift-style premium bento dashboard preview.
 */
export function ProductMockup({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={cn("relative mx-auto w-full max-w-[680px]", className)}>
      <div
        className="relative overflow-hidden rounded-[1.75rem] border border-[var(--border-xs)] bg-carbon-1/95 shadow-elevated"
        style={{ boxShadow: "var(--shadow-glow)" }}
      >
        <div className="flex items-center gap-2 border-b border-[var(--border-xs)] bg-carbon-2/80 px-5 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-signal-500/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-volt-500/70" />
          <span className="ml-3 font-mono text-[11px] tabular-nums text-ink-500">
            fitconnect.app / dashboard
          </span>
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-volt-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-volt-400" />
            Live
          </span>
        </div>

        <div className="relative grid auto-rows-[minmax(88px,auto)] grid-cols-4 gap-3 p-5">
          <RiftBento tone="volt" span="md" className="min-h-[168px]">
            <RiftLabel>AI Readiness</RiftLabel>
            <div className="flex items-end justify-between gap-3">
              <div>
                <RiftScore value={<Ticker base={62} target={82} />} />
                <p className="mt-1 text-[10px] font-semibold text-volt-400">Train hard</p>
              </div>
              <ReadinessRing />
            </div>
          </RiftBento>

          <RiftBento tone="neutral">
            <div className="flex items-center justify-between">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-signal-500/10 text-signal-400">
                <HeartRateIcon className="h-4 w-4" />
              </span>
              <span className="text-[10px] font-semibold tabular-nums text-emerald-500">+4</span>
            </div>
            <p className="mt-2 font-display text-xl font-extrabold tabular-nums text-ink-50">68 ms</p>
            <p className="text-[10px] text-ink-500">HRV · 7d</p>
            <Sparkline />
          </RiftBento>

          <RiftBento
            id="fc-next-session"
            tone="connect"
            className="flex flex-col"
          >
            <div className="flex items-center justify-between">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/30">
                <CalendarStreakIcon className="h-4 w-4" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-300">
                07:30
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold leading-snug text-ink-50">
              Lower body strength
            </p>
            <p className="text-[10px] text-ink-400">with Tomás · Online</p>
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-grad-pulse py-1.5 px-2 text-[11px] font-bold text-ink-950 shadow-volt-glow"
            >
              <PlayCircle className="h-3 w-3" /> Start session
            </button>
          </RiftBento>

          <RiftBento tone="neutral" span="full">
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-200">
                <StopwatchIcon className="h-3.5 w-3.5 text-brand-300" />
                7-day load
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-volt-400">
                Polarised · 81 / 19
              </p>
            </div>
            <div className="flex h-16 items-end gap-1.5">
              {loadBars.map((h, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex-1 rounded-md bg-gradient-to-t from-volt-600 to-volt-400",
                    mounted && "fc-bar-pop"
                  )}
                  style={{
                    height: `${h}%`,
                    opacity: 0.65 + i * 0.04,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          </RiftBento>

          <RiftBento tone="cyan" span="full" className="flex items-center gap-3">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-cyan-dim text-cyan-500 ring-1 ring-cyan-500/20">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <p className="flex-1 text-[11px] leading-snug text-ink-200">
              <span className="font-semibold text-ink-50">AI suggestion ·</span>{" "}
              HRV +4 ms — keep planned 5×5 back-squat at 82.5 kg
            </p>
            <span className="rounded-full bg-cyan-dim px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan-500">
              Approved
            </span>
          </RiftBento>

          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="fc-cursor absolute left-0 top-0" style={{ width: 28, height: 28 }}>
              <span className="relative grid h-7 w-7 place-items-center">
                <span className="absolute inset-0 rounded-full bg-volt-400/30 blur-md" />
                <MousePointer2
                  className="h-4 w-4 -rotate-12 text-ink-50 drop-shadow"
                  fill="currentColor"
                />
              </span>
            </div>

            <div className="fc-toast absolute right-3 top-3">
              <div className="flex items-center gap-2 rounded-xl border border-volt-500/30 bg-carbon-2/95 px-3 py-2 shadow-elevated backdrop-blur">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-volt-500/15 text-volt-400">
                  <Bell className="h-3 w-3" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold leading-tight text-ink-50">
                    Tomás approved today&apos;s plan
                  </p>
                  <p className="text-[9px] text-ink-400">just now</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass absolute -bottom-4 -left-3 hidden items-center gap-2 rounded-2xl px-3 py-2 shadow-elevated md:flex">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-volt-500/10 text-volt-400">
          <RecoveryRingIcon className="h-4 w-4" />
        </span>
        <div className="text-[11px]">
          <p className="font-semibold leading-tight text-ink-100">5-week PR streak</p>
          <p className="text-ink-400">Best in 18 months</p>
        </div>
      </div>
    </div>
  );
}

function ReadinessRing() {
  return (
    <div className="relative h-[64px] w-[64px] shrink-0">
      <svg
        viewBox="0 0 80 80"
        className="absolute inset-0 h-full w-full -rotate-90"
        aria-hidden="true"
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
          stroke="#C8FF00"
          strokeWidth="7"
          strokeLinecap="round"
          className="fc-ring-loop"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <p className="font-display text-base font-bold tabular-nums text-volt-500">82</p>
      </div>
    </div>
  );
}

function Sparkline() {
  return (
    <svg viewBox="0 0 120 32" className="mt-2 h-7 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="fcSpark" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00DDB4" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#C8FF00" />
        </linearGradient>
      </defs>
      <path
        className="fc-spark-trace"
        d="M2 22 L 14 16 L 26 24 L 38 12 L 50 18 L 62 8 L 74 14 L 86 6 L 98 12 L 110 4 L 118 8"
        fill="none"
        stroke="url(#fcSpark)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Ticker({ base, target }: { base: number; target: number }) {
  return (
    <span className="relative inline-block h-[1em] overflow-hidden align-middle">
      <span className="fc-tick-flip block">
        <span className="block">{base}</span>
        <span className="block">{target}</span>
      </span>
    </span>
  );
}
