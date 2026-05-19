"use client";

import Link from "next/link";
import { useState } from "react";
import { Calendar, Video, X, Clock } from "lucide-react";
import type { SessionSummary } from "@fitconnect/types";
import { PremiumCard } from "@/components/ui-glass/premium-system";
import { Button } from "@/components/ui/button";
import { useDashboardStore } from "@/lib/dashboard-store";

export function SessionsList({
  sessions,
  loading
}: {
  sessions: SessionSummary[];
  loading?: boolean;
}) {
  const cancelSession = useDashboardStore((s) => s.cancelSession);
  const rescheduleSession = useDashboardStore((s) => s.rescheduleSession);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleWhen, setRescheduleWhen] = useState("");

  if (loading) {
    return <p className="text-sm text-ink-400">Loading sessions…</p>;
  }

  const upcoming = sessions.filter((s) => s.status === "scheduled");
  const past = sessions.filter(
    (s) => s.status === "completed" || s.status === "cancelled"
  );

  if (!sessions.length) {
    return <p className="text-sm text-ink-400">No sessions scheduled yet.</p>;
  }

  function submitReschedule(id: string) {
    if (!rescheduleWhen.trim()) return;
    rescheduleSession(id, rescheduleWhen.trim());
    setRescheduleId(null);
    setRescheduleWhen("");
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-sm uppercase tracking-widest text-ink-400 mb-3">
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-ink-500">No upcoming sessions.</p>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((s) => (
              <li key={s.id}>
                <PremiumCard className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-50">{s.type}</p>
                      <p className="mt-1 text-xs text-ink-400">
                        {s.mode} · {s.intensity} · {s.when}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {s.mode === "Online" && (
                        <Link
                          href={`/sessions/${s.id}/room`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-grad-pulse text-ink-950"
                          aria-label={`Join ${s.type}`}
                        >
                          <Video className="h-4 w-4" />
                        </Link>
                      )}
                      <Calendar className="h-4 w-4 text-ink-500" aria-hidden />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRescheduleId(s.id);
                        setRescheduleWhen(s.when);
                      }}
                    >
                      <Clock className="h-3.5 w-3.5" aria-hidden />
                      Reschedule
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => cancelSession(s.id)}
                    >
                      <X className="h-3.5 w-3.5" aria-hidden />
                      Cancel
                    </Button>
                  </div>
                  {rescheduleId === s.id && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      <input
                        value={rescheduleWhen}
                        onChange={(e) => setRescheduleWhen(e.target.value)}
                        placeholder="e.g. Fri · 08:00"
                        className="flex-1 min-w-[160px] rounded-xl border border-ink-800 bg-ink-950/60 px-3 py-2 text-sm"
                        aria-label="New session time"
                      />
                      <Button type="button" size="sm" onClick={() => submitReschedule(s.id)}>
                        Save
                      </Button>
                    </div>
                  )}
                </PremiumCard>
              </li>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="text-sm uppercase tracking-widest text-ink-400 mb-3">
            Past & cancelled
          </h2>
          <ul className="space-y-3">
            {past.map((s) => (
              <li key={s.id}>
                <PremiumCard className="flex items-center justify-between gap-3 p-4 opacity-80">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-50">{s.type}</p>
                    <p className="mt-1 text-xs text-ink-400">{s.when}</p>
                  </div>
                  <span className="rounded-full border border-glass-border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-400">
                    {s.status}
                  </span>
                </PremiumCard>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
