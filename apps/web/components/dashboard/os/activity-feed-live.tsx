"use client";

import { DEMO_STRAVA_ACTIVITIES } from "@/lib/integrations/store";
import { formatMsg, useLocale } from "@/lib/i18n-provider";
import { RealtimeBadge } from "@/components/ui-glass/premium-system";
import { useLiveDemoTelemetry } from "@/lib/demo/live-telemetry";
import { cn } from "@/lib/utils";

const SPORT_EMOJI: Record<string, string> = {
  Run: "🏃",
  Ride: "🚴",
  Workout: "💪",
  Swim: "🏊",
  Yoga: "🧘"
};

function formatRelativeTime(iso: string, copy: ReturnType<typeof useLocale>["dashboard"]["activity_feed"]) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 1) return copy.justNow;
  if (hours < 24) return formatMsg(copy.hoursAgo, { hours });
  const days = Math.floor(hours / 24);
  return formatMsg(copy.daysAgo, { days });
}

function formatDistance(meters: number) {
  if (meters <= 0) return "—";
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

type ActivityFeedLiveProps = {
  className?: string;
};

export function ActivityFeedLive({ className }: ActivityFeedLiveProps) {
  const { dashboard } = useLocale();
  const copy = dashboard.activity_feed;
  const live = useLiveDemoTelemetry();
  const items = DEMO_STRAVA_ACTIVITIES.slice(0, 4);

  return (
    <div
      className={cn(
        "rounded-2xl border border-ink-800 bg-ink-900/40 p-5",
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-display text-sm font-bold text-ink-100">{copy.title}</h3>
        <RealtimeBadge>{copy.live}</RealtimeBadge>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-ink-500">{copy.empty}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((activity, index) => (
            <li
              key={activity.id}
              className="flex items-start gap-3 rounded-xl border border-ink-800/80 bg-ink-950/50 px-3 py-2.5"
            >
              <span className="text-lg leading-none" aria-hidden>
                {SPORT_EMOJI[activity.type] ?? "⚡"}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-medium text-ink-100">{activity.name}</p>
                  {index === 0 ? (
                    <span className="shrink-0 rounded-full bg-volt-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-volt-400">
                      {copy.live}
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-xs text-ink-500">
                  {formatDistance(activity.distanceM)} · {formatDuration(activity.movingTimeSec)} ·{" "}
                  {index === 0 ? (
                    <span className="tabular-nums text-eos-telemetry">
                      {live.hrBpm} bpm · {copy.live}
                    </span>
                  ) : (
                    formatRelativeTime(activity.startDate, copy)
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
