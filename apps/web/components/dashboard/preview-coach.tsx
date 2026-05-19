"use client";

import { MessageSquare } from "lucide-react";
import { BrowserFrame } from "./browser-frame";
import { RiftBento, RiftLabel, RiftScore } from "@/components/ui-glass/rift-bento";

const revenueBars = [42, 58, 51, 72, 68, 84, 91];

const roster = [
  { name: "Inês M.", score: 94, status: "volt" as const },
  { name: "João R.", score: 62, status: "amber" as const },
  { name: "Sara K.", score: 88, status: "connect" as const }
];

/** Coach dashboard mini-preview — Rift-style bento grid. */
export function PreviewCoach({ frameless = false }: { frameless?: boolean }) {
  const body = (
    <div className="grid grid-cols-4 auto-rows-[minmax(88px,auto)] gap-3">
      <RiftBento tone="connect" span="md" className="min-h-[168px]">
        <RiftLabel>Roster health</RiftLabel>
        <RiftScore value={81} className="text-brand-400" />
        <p className="mt-1 text-[10px] font-semibold text-emerald-500">12 athletes · 3 alerts</p>
        <div className="mt-4 space-y-2">
          {roster.map((a) => (
            <div
              key={a.name}
              className="flex items-center justify-between rounded-xl border border-[var(--border-xs)] bg-carbon-3/80 px-3 py-2 text-xs"
            >
              <span className="font-semibold text-ink-100">{a.name}</span>
              <span
                className={`font-display text-sm font-extrabold ${
                  a.status === "volt"
                    ? "text-volt-500"
                    : a.status === "connect"
                      ? "text-brand-400"
                      : "text-amber-400"
                }`}
              >
                {a.score}
              </span>
            </div>
          ))}
        </div>
      </RiftBento>

      <RiftBento tone="volt">
        <RiftLabel>Revenue</RiftLabel>
        <p className="mt-2 font-display text-2xl font-extrabold text-volt-500">€4.3k</p>
        <p className="text-[10px] text-emerald-500 font-semibold">+18% MTD</p>
      </RiftBento>

      <RiftBento tone="neutral">
        <RiftLabel>Sessions</RiftLabel>
        <p className="mt-2 font-display text-2xl font-extrabold text-ink-50">62</p>
        <p className="text-[10px] text-ink-400">this week</p>
      </RiftBento>

      <RiftBento tone="neutral">
        <RiftLabel>Retention</RiftLabel>
        <p className="mt-2 font-display text-2xl font-extrabold text-ink-50">94%</p>
        <p className="text-[10px] text-ink-400">90-day</p>
      </RiftBento>

      <RiftBento tone="connect">
        <RiftLabel>Rebook</RiftLabel>
        <p className="mt-2 font-display text-2xl font-extrabold text-brand-400">71%</p>
        <p className="text-[10px] text-emerald-500 font-semibold">+4 pts</p>
      </RiftBento>

      <RiftBento tone="neutral" span="full">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-ink-100">Weekly revenue</p>
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-400">
            Stripe live
          </span>
        </div>
        <div className="flex h-20 items-end gap-2" role="img" aria-label="Weekly revenue chart">
          {revenueBars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-lg bg-gradient-to-t from-brand-600 to-brand-400"
              style={{ height: `${h}%`, opacity: 0.45 + i * 0.06 }}
            />
          ))}
        </div>
      </RiftBento>

      <RiftBento tone="live" span="full" className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-signal-500/10 text-signal-400 ring-1 ring-signal-500/20">
          <MessageSquare className="h-4 w-4" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink-100">
            3 athletes flagged · adjust Thursday intensity
          </p>
          <p className="mt-1 text-xs text-ink-400">
            HRV dips synced from wearables. One-tap plan nudges ready.
          </p>
        </div>
      </RiftBento>
    </div>
  );

  if (frameless) {
    return <div className="px-3 pb-3">{body}</div>;
  }

  return (
    <BrowserFrame path="fitconnect.app / coach/dashboard">{body}</BrowserFrame>
  );
}
