"use client";

import { Sparkles, Zap } from "lucide-react";
import { BrowserFrame } from "./browser-frame";
import { RiftBento, RiftLabel, RiftScore } from "@/components/ui-glass/rift-bento";

const loadBars = [55, 30, 80, 25, 92, 40, 70];

/** Athlete dashboard mini-preview — Rift-style bento grid. */
export function PreviewAthlete({ frameless = false }: { frameless?: boolean }) {
  const body = (
    <div className="grid grid-cols-4 auto-rows-[minmax(88px,auto)] gap-3">
      <RiftBento tone="volt" span="md" className="flex flex-col justify-between min-h-[168px]">
        <RiftLabel>AI Readiness</RiftLabel>
        <div className="flex items-end justify-between gap-3">
          <div>
            <RiftScore value={82} />
            <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-volt-400">
              <Zap className="h-3 w-3" aria-hidden /> Train hard
            </p>
          </div>
          <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90" aria-hidden>
            <circle cx="40" cy="40" r="32" fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
            <circle
              cx="40"
              cy="40"
              r="32"
              fill="transparent"
              stroke="#C8FF00"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 32}
              strokeDashoffset={2 * Math.PI * 32 * 0.18}
            />
          </svg>
        </div>
      </RiftBento>

      <RiftBento tone="neutral">
        <RiftLabel>HRV</RiftLabel>
        <p className="mt-2 font-display text-2xl font-extrabold text-ink-50">68</p>
        <p className="text-[10px] text-emerald-500 font-semibold">+4 ms</p>
      </RiftBento>

      <RiftBento tone="neutral">
        <RiftLabel>Sleep</RiftLabel>
        <p className="mt-2 font-display text-2xl font-extrabold text-ink-50">7h42</p>
        <p className="text-[10px] text-brand-400 font-semibold">89% quality</p>
      </RiftBento>

      <RiftBento tone="cyan">
        <RiftLabel>VO₂max</RiftLabel>
        <p className="mt-2 font-display text-2xl font-extrabold text-cyan-500">52.4</p>
        <p className="text-[10px] text-ink-400">+1.2 trend</p>
      </RiftBento>

      <RiftBento tone="connect">
        <RiftLabel>Load (7d)</RiftLabel>
        <p className="mt-2 font-display text-2xl font-extrabold text-brand-400">6.4k</p>
        <p className="text-[10px] text-ink-400">Polarised · 80/20</p>
      </RiftBento>

      <RiftBento tone="neutral" span="full">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-ink-100">Weekly load</p>
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-volt-500">
            On target
          </span>
        </div>
        <div className="flex h-20 items-end gap-2" role="img" aria-label="Weekly training load chart">
          {loadBars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-lg bg-gradient-to-t from-volt-600 to-volt-400"
              style={{ height: `${h}%`, opacity: 0.45 + i * 0.06 }}
            />
          ))}
        </div>
      </RiftBento>

      <RiftBento tone="cyan" span="full" className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-dim text-cyan-500 ring-1 ring-cyan-500/20">
          <Sparkles className="h-4 w-4" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink-100">
            AI · move tomorrow&apos;s threshold to Thursday
          </p>
          <p className="mt-1 text-xs text-ink-400">
            HRV down 8 ms, sleep efficiency 76%. Coach notified.
          </p>
        </div>
      </RiftBento>
    </div>
  );

  if (frameless) {
    return <div className="px-3 pb-3">{body}</div>;
  }

  return (
    <BrowserFrame path="fitconnect.app / dashboard">{body}</BrowserFrame>
  );
}
