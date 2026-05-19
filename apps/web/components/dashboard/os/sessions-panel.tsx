"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronRight, Clock, RefreshCw, Video, X } from "lucide-react";
import type { SessionSummary } from "@fitconnect/types";

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-brand-400/12 text-brand-400 border-brand-400/25",
  upcoming: "bg-brand-400/12 text-brand-400 border-brand-400/25",
  completed: "bg-lime-500/12 text-lime-400 border-lime-500/25",
  cancelled: "bg-signal-500/12 text-signal-500 border-signal-500/25",
  rescheduled: "bg-plasma-500/12 text-plasma-500 border-plasma-500/25"
};

const SPORT_EMOJI: Record<string, string> = {
  yoga: "🧘",
  climbing: "🧗",
  cycling: "🚴",
  running: "🏃",
  swimming: "🏊",
  bjj: "🥋",
  strength: "💪"
};

export function SessionsPanel({
  sessions,
  loading,
  coachName = "Coach"
}: {
  sessions: SessionSummary[];
  loading?: boolean;
  coachName?: string;
}) {
  const upcoming = sessions.filter((s) => s.status === "scheduled" || s.status === "live");
  const past = sessions.filter((s) => s.status === "completed");

  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-ink-100">Sessions</h3>
        <Button asChild variant="ghost" size="sm" className="h-7 gap-1 text-xs text-ink-500 hover:text-ink-300">
          <Link href="/sessions">
            View calendar <ChevronRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-ink-400">Loading sessions…</p>
      ) : (
        <>
          <div className="mb-4">
            <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-ink-500">
              Upcoming
            </p>
            <div className="space-y-2">
              {upcoming.length === 0 ? (
                <p className="text-sm text-ink-500">No upcoming sessions.</p>
              ) : (
                upcoming.map((s) => {
                  const isToday = s.when.toLowerCase().includes("today");
                  return (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 rounded-xl border border-ink-800/60 bg-ink-950/40 p-3 transition-all hover:border-ink-700 hover:bg-ink-950/60"
                    >
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink-800 text-lg">
                        {SPORT_EMOJI[s.type.toLowerCase()] ?? "💪"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink-200">{coachName}</p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2">
                          <span className="flex items-center gap-0.5 text-[10px] text-ink-500">
                            <Calendar className="h-2.5 w-2.5" />
                            {s.when}
                          </span>
                          <span className="text-[10px] text-ink-600">·</span>
                          <span className="text-[10px] text-ink-500">{s.type}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`border text-[10px] ${STATUS_STYLES[s.status] ?? STATUS_STYLES.scheduled}`}
                        >
                          {s.status}
                        </Badge>
                        {isToday && s.mode === "Online" && (
                          <Button
                            asChild
                            size="sm"
                            className="h-7 gap-1 rounded-lg border border-brand-400/25 bg-brand-500/20 px-2 text-[10px] text-brand-400"
                          >
                            <Link href={`/sessions/${s.id}/room`}>
                              <Video className="h-3 w-3" /> Join
                            </Link>
                          </Button>
                        )}
                        <div className="flex gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            className="h-7 w-7 rounded-lg text-ink-600 hover:text-ink-300"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            className="h-7 w-7 rounded-lg text-ink-600 hover:text-signal-500"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {past.length > 0 && (
            <div>
              <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-ink-500">
                Recent
              </p>
              <div className="space-y-2">
                {past.slice(0, 3).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 rounded-xl border border-ink-800/40 bg-ink-950/20 p-3 opacity-70 transition-opacity hover:opacity-100"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink-900 text-lg">
                      {SPORT_EMOJI[s.type.toLowerCase()] ?? "💪"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-400">{s.type}</p>
                      <span className="flex items-center gap-0.5 text-[10px] text-ink-600">
                        <Clock className="h-2.5 w-2.5" />
                        {s.when}
                      </span>
                    </div>
                    <Badge className={`border text-[10px] ${STATUS_STYLES.completed}`}>
                      {s.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
