"use client";

import { BrowserFrame } from "./browser-frame";
import { BentoCard } from "@/components/elite-os/bento-card";

const roster = [
  { name: "J. Smith", hrv: "85ms", status: "volt" as const },
  { name: "M. Chen", hrv: "45ms", status: "alert" as const }
];

/** Coach dashboard mini-preview — Stitch command center bento. */
export function PreviewCoach({ frameless = false }: { frameless?: boolean }) {
  const body = (
    <div className="grid auto-rows-[minmax(88px,auto)] grid-cols-1 gap-3 bg-[var(--eos-floor)] p-3 md:grid-cols-12">
      <BentoCard className="md:col-span-3" elevation="1" label="ACTIVE ROSTER">
        <div className="space-y-2">
          {roster.map((a) => (
            <div
              key={a.name}
              className="flex items-center justify-between rounded-lg border border-white/5 bg-eos-elevated px-2 py-2 text-xs"
            >
              <span className="font-semibold text-eos-on-surface">{a.name}</span>
              <span className={a.status === "alert" ? "text-eos-alert" : "text-eos-voltline"}>
                {a.hrv}
              </span>
            </div>
          ))}
        </div>
      </BentoCard>

      <BentoCard className="min-h-[180px] md:col-span-6" elevation="1" label="TEAM READINESS">
        <div className="flex h-24 items-end gap-2">
          {[60, 85, 40, 95, 75, 65].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t border-t-2 border-eos-voltline bg-eos-voltline/20"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </BentoCard>

      <BentoCard className="flex flex-col md:col-span-3" elevation="glass" label="AI INSIGHTS">
        <p className="flex-1 text-sm text-eos-on-surface-muted">
          M. Chen showing sustained sympathetic dominance. Reduce volume 20%.
        </p>
        <button type="button" className="mt-3 w-full rounded-lg bg-eos-voltline py-2 eos-label-caps text-[10px] text-[#070b14]">
          GENERATE PLAN
        </button>
      </BentoCard>
    </div>
  );

  if (frameless) return body;
  return <BrowserFrame path="fitconnect.app / coach/dashboard">{body}</BrowserFrame>;
}
