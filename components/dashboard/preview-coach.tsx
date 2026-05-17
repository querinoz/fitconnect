"use client";

import {
  Calendar,
  HeartPulse,
  MessageSquare,
  TrendingUp,
  Users,
  Wallet
} from "lucide-react";
import { BrowserFrame } from "./browser-frame";
import { KpiTile } from "./kpi-tile";

const revenueBars = [42, 58, 51, 72, 68, 84, 91];

const roster = [
  { name: "Inês M.", hrv: 68, status: "green" as const },
  { name: "João R.", hrv: 49, status: "amber" as const },
  { name: "Sara K.", hrv: 71, status: "green" as const }
];

/** Coach dashboard mini-preview — mirrors /coach/dashboard visual language. */
export function PreviewCoach() {
  return (
    <BrowserFrame path="fitconnect.app / coach/dashboard">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-1 rounded-2xl border border-ink-800 bg-ink-950/60 p-4">
          <p className="text-[10px] uppercase tracking-widest text-ink-500">
            Active athletes
          </p>
          <p className="mt-3 font-display text-4xl font-bold tabular-nums text-ink-50">
            41
          </p>
          <p className="text-[11px] text-accent-400 mt-1">+6 this month</p>
          <div className="mt-4 space-y-2">
            {roster.map((a) => (
              <div
                key={a.name}
                className="flex items-center justify-between rounded-xl border border-ink-800 bg-ink-900/50 px-3 py-2 text-xs"
              >
                <span className="text-ink-200 font-medium">{a.name}</span>
                <span className="flex items-center gap-2 tabular-nums text-ink-400">
                  <HeartPulse className="h-3 w-3 text-signal-400" aria-hidden />
                  {a.hrv} ms
                  <span
                    className={`h-2 w-2 rounded-full ${
                      a.status === "green"
                        ? "bg-accent-400"
                        : "bg-amber-400"
                    }`}
                    aria-hidden
                  />
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2 grid grid-cols-2 gap-3">
          <KpiTile
            icon={Wallet}
            iconClassName="text-accent-400"
            label="Revenue MTD"
            value="€4,280"
            delta="+18%"
          />
          <KpiTile
            icon={Calendar}
            iconClassName="text-brand-300"
            label="Sessions"
            value="62"
            delta="this week"
          />
          <KpiTile
            icon={Users}
            iconClassName="text-plasma-400"
            label="Retention"
            value="94%"
            delta="90-day"
          />
          <KpiTile
            icon={TrendingUp}
            iconClassName="text-signal-400"
            label="Rebook rate"
            value="71%"
            delta="+4 pts"
          />
        </div>

        <div className="sm:col-span-3 rounded-2xl border border-ink-800 bg-ink-950/60 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-ink-100">Weekly revenue</p>
            <span className="text-[10px] uppercase tracking-widest text-brand-300 font-semibold">
              Stripe · live
            </span>
          </div>
          <div className="flex items-end gap-2 h-24" role="img" aria-label="Weekly revenue chart">
            {revenueBars.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-md bg-gradient-to-t from-plasma-500 to-brand-500"
                style={{ height: `${h}%`, opacity: 0.55 + i * 0.05 }}
              />
            ))}
          </div>
        </div>

        <div className="sm:col-span-3 rounded-2xl border border-brand-500/30 bg-brand-500/5 p-4 flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500/10 text-brand-300 shrink-0">
            <MessageSquare className="h-4 w-4" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-100">
              3 athletes flagged amber · adjust Thursday intensity
            </p>
            <p className="text-xs text-ink-400 mt-1">
              HRV dips synced from wearables. One-tap plan nudges ready to send.
            </p>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}
