"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Minus,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import { useDashboardStore, selectAthletesForCoach } from "@/lib/dashboard-store";
import { useShallow } from "zustand/react/shallow";

const FALLBACK = [
  {
    name: "Marina Santos",
    sport: "Yoga",
    hrv: 56,
    readiness: 82,
    trend: "up" as const,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face"
  },
  {
    name: "Pedro Silva",
    sport: "Cycling",
    hrv: 48,
    readiness: 63,
    trend: "down" as const,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
  }
];

export function AthletesListPanel({ coachId }: { coachId: string }) {
  const athletes = useDashboardStore(
    useShallow((s) => selectAthletesForCoach(s, coachId).slice(0, 5))
  );

  const rows = athletes.length
    ? athletes.map((a) => ({
        name: a.name,
        sport: a.sports[0] ?? "Athlete",
        hrv: a.hrv,
        readiness: a.readiness,
        trend:
          a.recoveryStatus === "green"
            ? ("up" as const)
            : a.recoveryStatus === "red"
              ? ("down" as const)
              : ("stable" as const),
        avatar: a.avatar
      }))
    : FALLBACK;
  const avg = Math.round(rows.reduce((s, a) => s + a.readiness, 0) / rows.length);

  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-sm font-bold text-ink-100">Active Athletes</h3>
        <Button asChild variant="ghost" size="sm" className="h-7 gap-1 text-xs text-ink-500 hover:text-ink-300">
          <Link href="/coach/roster">
            View all <ChevronRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        {rows.map((a) => {
          const rColor =
            a.readiness >= 75
              ? "text-lime-400"
              : a.readiness >= 50
                ? "text-brand-400"
                : "text-signal-500";
          const rBg =
            a.readiness >= 75
              ? "bg-lime-500/10 border-lime-500/20"
              : a.readiness >= 50
                ? "bg-brand-400/10 border-brand-400/20"
                : "bg-signal-500/10 border-signal-500/20";
          const TIcon =
            a.trend === "up" ? TrendingUp : a.trend === "down" ? TrendingDown : Minus;
          const tColor =
            a.trend === "up"
              ? "text-lime-400"
              : a.trend === "down"
                ? "text-signal-500"
                : "text-ink-500";

          return (
            <div
              key={a.name}
              className="group flex cursor-pointer items-center gap-3 rounded-xl border border-ink-800/60 bg-ink-950/30 px-3 py-2.5 transition-all hover:border-ink-700 hover:bg-ink-950/60"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.avatar} alt="" className="h-9 w-9 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-ink-200">{a.name}</p>
                <p className="text-[10px] text-ink-500">{a.sport}</p>
              </div>
              <div className="mr-1 text-right">
                <div className="flex items-center justify-end gap-1">
                  <TIcon className={`h-3 w-3 ${tColor}`} />
                  <span className="text-xs font-medium text-ink-300">{a.hrv} ms</span>
                </div>
                <p className="text-[10px] text-ink-500">HRV</p>
              </div>
              <div
                className={`grid h-9 w-11 shrink-0 place-items-center rounded-lg border ${rBg}`}
              >
                <span className={`text-xs font-bold ${rColor}`}>{a.readiness}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-ink-800/60 pt-3 text-[10px] text-ink-500">
        <span>{rows.length} shown</span>
        <span>
          Readiness avg: <span className="font-semibold text-lime-400">{avg}</span>
        </span>
      </div>
    </div>
  );
}
