"use client";

import { useEffect, useState } from "react";
import { Bell, MousePointer2, PlayCircle, Sparkles } from "lucide-react";
import {
  CalendarStreakIcon,
  HeartRateIcon,
  RecoveryRingIcon,
  StopwatchIcon
} from "@/components/brand/icons";
import { cn } from "@/lib/utils";

/**
 * Animated product mockup — an in-code miniature of the /dashboard route.
 *
 * Composition (left → right, top → bottom):
 *  - readiness ring (loops 51→82→51 via stroke-dashoffset)
 *  - HRV sparkline (continuous trace)
 *  - "next session" card with a Start button (target of cursor)
 *  - weekly volume bar chart (entry-pop on mount)
 *  - a number ticker (62 → 68) and a notification toast
 *  - a faux cursor traces from the readiness ring → start button
 *
 * All animations are CSS-driven so they keep running when offscreen
 * and stop instantly when prefers-reduced-motion is set.
 */
export function ProductMockup({ className }: { className?: string }) {
  // Mount-only flag so the entry-pop only runs once we're on the client,
  // avoiding a hydration mismatch from `Math.random` or `Date.now()`.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={cn(
        "relative w-full max-w-[680px] mx-auto",
        className
      )}
    >
      {/* outer plate w/ chrome */}
      <div
        className="relative rounded-3xl border border-ink-800 bg-ink-950/80 shadow-elevated overflow-hidden"
        style={{ boxShadow: "var(--shadow-glow)" }}
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-ink-800/80 px-5 py-3 bg-ink-950/60">
          <span className="h-2.5 w-2.5 rounded-full bg-signal-500/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent-500/60" />
          <span className="ml-3 text-[11px] text-ink-500 font-mono tabular-nums">
            fitconnect.app / dashboard
          </span>
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-accent-400 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-pulse" />
            Live
          </span>
        </div>

        <div className="p-5 grid grid-cols-12 gap-3 relative">
          {/* Readiness ring */}
          <div className="col-span-12 sm:col-span-4 rounded-2xl border border-ink-800 bg-ink-950/70 p-4 flex items-center gap-3">
            <ReadinessRing />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-ink-500">
                Readiness
              </p>
              <p className="font-display text-3xl font-bold gradient-text leading-none tabular-nums">
                <Ticker base={62} target={82} />
              </p>
              <p className="mt-1 text-[10px] text-accent-400 font-semibold">
                Train hard
              </p>
            </div>
          </div>

          {/* HRV sparkline */}
          <div className="col-span-6 sm:col-span-4 rounded-2xl border border-ink-800 bg-ink-950/70 p-4">
            <div className="flex items-center justify-between">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-signal-500/10 text-signal-400">
                <HeartRateIcon className="h-4 w-4" />
              </span>
              <span className="text-[10px] text-accent-400 font-semibold tabular-nums">
                +4
              </span>
            </div>
            <p className="mt-2 font-display text-xl font-bold tabular-nums">
              68 ms
            </p>
            <p className="text-[10px] text-ink-500">HRV · 7d</p>
            <Sparkline />
          </div>

          {/* Next session card — the cursor settles here */}
          <div
            id="fc-next-session"
            className="col-span-6 sm:col-span-4 rounded-2xl border border-ink-800 bg-gradient-to-br from-brand-500/10 via-ink-950/70 to-accent-500/10 p-4 flex flex-col"
          >
            <div className="flex items-center justify-between">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/30">
                <CalendarStreakIcon className="h-4 w-4" />
              </span>
              <span className="text-[10px] uppercase tracking-widest text-brand-300 font-semibold">
                07:30
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold text-ink-50 leading-snug">
              Lower body strength
            </p>
            <p className="text-[10px] text-ink-400">with Tomás · Online</p>
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-400 to-accent-500 text-ink-950 text-[11px] font-bold py-1.5 px-2"
            >
              <PlayCircle className="h-3 w-3" /> Start session
            </button>
          </div>

          {/* Weekly bar chart */}
          <div className="col-span-12 rounded-2xl border border-ink-800 bg-ink-950/70 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-ink-200 flex items-center gap-1.5">
                <StopwatchIcon className="h-3.5 w-3.5 text-brand-300" />
                7-day load
              </p>
              <p className="text-[10px] uppercase tracking-widest text-accent-400 font-bold">
                Polarised · 81 / 19
              </p>
            </div>
            <div className="flex items-end gap-1.5 h-16">
              {[55, 18, 80, 25, 92, 30, 70].map((h, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex-1 rounded-md bg-gradient-to-t from-brand-500 to-accent-500",
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
          </div>

          {/* Coach AI nudge band */}
          <div className="col-span-12 rounded-2xl border border-plasma-500/30 bg-plasma-500/5 p-3 flex items-center gap-3">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-plasma-500/15 text-plasma-300">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <p className="text-[11px] text-ink-200 leading-snug flex-1">
              <span className="font-semibold text-ink-50">AI suggestion ·</span>{" "}
              HRV +4 ms — keep planned 5×5 back-squat at 82.5 kg
            </p>
            <span className="rounded-full bg-plasma-500/15 text-plasma-300 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
              Approved
            </span>
          </div>

          {/* Cursor */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
          >
            <div
              className="fc-cursor absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: 0, top: 0 }}
            >
              <span className="relative grid h-7 w-7 place-items-center">
                <span className="absolute inset-0 rounded-full bg-brand-400/30 blur-md" />
                <MousePointer2
                  className="h-4 w-4 text-ink-50 -rotate-12 drop-shadow"
                  fill="currentColor"
                />
              </span>
            </div>

            {/* Notification toast */}
            <div className="fc-toast absolute right-3 top-3">
              <div className="rounded-xl border border-accent-500/40 bg-ink-950/95 backdrop-blur px-3 py-2 shadow-elevated flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-accent-500/15 text-accent-400">
                  <Bell className="h-3 w-3" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold text-ink-50 leading-tight">
                    Tomás approved today&apos;s plan
                  </p>
                  <p className="text-[9px] text-ink-400">just now</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating chip — recovery ring summary peeks out */}
      <div className="absolute -left-3 -bottom-4 hidden md:flex items-center gap-2 rounded-2xl glass px-3 py-2 shadow-elevated">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent-500/10 text-accent-400">
          <RecoveryRingIcon className="h-4 w-4" />
        </span>
        <div className="text-[11px]">
          <p className="text-ink-100 font-semibold leading-tight">
            5-week PR streak
          </p>
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
        className="absolute inset-0 -rotate-90 h-full w-full"
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
          stroke="url(#fcMockRing)"
          strokeWidth="7"
          strokeLinecap="round"
          className="fc-ring-loop"
        />
        <defs>
          <linearGradient id="fcMockRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#84cc16" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <p className="font-display text-base font-bold tabular-nums text-ink-100">
          82
        </p>
      </div>
    </div>
  );
}

function Sparkline() {
  return (
    <svg
      viewBox="0 0 120 32"
      className="mt-2 h-7 w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="fcSpark" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#f43f5e" />
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

/**
 * 2-digit ticker that flips between `base` and `target` on a fixed
 * 6.4s loop (matching the cursor and toast). Pure CSS — no JS interval.
 */
function Ticker({ base, target }: { base: number; target: number }) {
  return (
    <span className="relative inline-block h-[1em] overflow-hidden align-middle">
      <span className="block fc-tick-flip">
        <span className="block">{base}</span>
        <span className="block">{target}</span>
      </span>
    </span>
  );
}
