"use client";

import { BrowserFrame } from "./browser-frame";
import { BentoCard } from "@/components/elite-os/bento-card";
import { LabelCaps } from "@/components/elite-os/typography";

/** Athlete dashboard mini-preview — Stitch EOS bento. */
export function PreviewAthlete({ frameless = false }: { frameless?: boolean }) {
  const body = (
    <div className="grid auto-rows-[minmax(88px,auto)] grid-cols-1 gap-3 bg-[var(--eos-floor)] p-3 md:grid-cols-12">
      <BentoCard className="flex min-h-[200px] flex-col items-center justify-center md:col-span-8" elevation="glass">
        <LabelCaps className="mb-4 opacity-60">RECOVERY_INDEX_V2</LabelCaps>
        <div className="relative flex h-32 w-32 items-center justify-center">
          <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
            <path
              className="fill-none stroke-white/10"
              strokeWidth="2.5"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="fill-none stroke-eos-voltline"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="88, 100"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute font-display text-4xl font-bold text-eos-on-surface">88%</span>
        </div>
      </BentoCard>

      <BentoCard className="flex flex-col justify-between border-l-4 border-l-eos-voltline md:col-span-4" elevation="1">
        <div>
          <LabelCaps className="text-eos-voltline">AI_COACH_DIRECTIVE</LabelCaps>
          <p className="mt-3 text-sm text-eos-on-surface-muted">
            Shift today to <span className="font-semibold text-eos-voltline">Anaerobic Capacity</span>.
          </p>
        </div>
        <p className="eos-data-metric text-eos-voltline">Target Load 14.5–16.0</p>
      </BentoCard>

      <BentoCard className="md:col-span-6" elevation="1" label="STRAIN_METRICS">
        <p className="font-display text-3xl font-bold text-eos-on-surface">
          12.4<span className="text-base text-eos-on-surface-muted">/21</span>
        </p>
      </BentoCard>

      <BentoCard className="md:col-span-6" elevation="1" label="SLEEP_ARCHITECTURE">
        <p className="font-display text-2xl font-bold text-eos-on-surface">
          7h 42m <span className="text-sm font-normal text-eos-on-surface-muted">92% efficiency</span>
        </p>
      </BentoCard>
    </div>
  );

  if (frameless) return body;
  return <BrowserFrame path="fitconnect.app / dashboard">{body}</BrowserFrame>;
}
