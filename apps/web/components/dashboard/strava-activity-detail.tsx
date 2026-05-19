"use client";

import { useEffect, useState } from "react";
import { buildElevationProfile } from "@fitconnect/strava-integration";
import { StravaActivityMap } from "@/components/dashboard/strava-activity-map";
import { GlassCard } from "@/components/ui-glass/glass-card";

type ActivityDetail = {
  id: string;
  name: string;
  sportType: string;
  distanceM: number;
  movingTimeSec: number;
  avgHr?: number;
  elevationM?: number;
  mapPolyline?: string;
  streamsJson?: Record<string, { data: number[] }>;
};

type Props = {
  athleteId: string;
  activityId: string;
  open: boolean;
  onClose: () => void;
};

export function StravaActivityDetailDrawer({
  athleteId,
  activityId,
  open,
  onClose
}: Props) {
  const [activity, setActivity] = useState<ActivityDetail | null>(null);

  useEffect(() => {
    if (!open || !activityId) return;
    void fetch(
      `/api/v1/integrations/strava/activity?athleteId=${encodeURIComponent(athleteId)}&id=${encodeURIComponent(activityId)}`
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setActivity(d?.activity ?? null))
      .catch(() => setActivity(null));
  }, [open, athleteId, activityId]);

  if (!open) return null;

  const altitude = activity?.streamsJson?.altitude?.data ?? [];
  const distance = activity?.streamsJson?.distance?.data ?? [];
  const profile =
    altitude.length && distance.length
      ? buildElevationProfile(distance, altitude)
      : null;
  const maxElev = profile?.length
    ? Math.max(...profile.map((p) => p.elevationM))
    : 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/70 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Activity detail"
    >
      <GlassCard className="w-full max-w-lg max-h-[85vh] overflow-y-auto p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-brand-400">
              {activity?.sportType ?? "Activity"}
            </p>
            <h2 className="font-display text-xl font-bold text-ink-50">
              {activity?.name ?? "Loading…"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-ink-400 hover:text-ink-100"
          >
            Close
          </button>
        </div>

        {activity ? (
          <>
            <p className="mt-2 text-sm text-ink-400">
              {(activity.distanceM / 1000).toFixed(1)} km ·{" "}
              {Math.round(activity.movingTimeSec / 60)} min
              {activity.avgHr ? ` · ${Math.round(activity.avgHr)} bpm avg` : ""}
            </p>
            <div className="mt-4">
              <StravaActivityMap polyline={activity.mapPolyline} />
            </div>
            {profile?.length ? (
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink-500">
                  Elevation profile
                </p>
                <svg viewBox="0 0 320 80" className="h-20 w-full rounded-xl bg-ink-950/60">
                  <polyline
                    fill="none"
                    stroke="#C8FF00"
                    strokeWidth="2"
                    points={profile
                      .map((p, i) => {
                        const x = (i / Math.max(profile.length - 1, 1)) * 320;
                        const y = 75 - (p.elevationM / maxElev) * 65;
                        return `${x},${y}`;
                      })
                      .join(" ")}
                  />
                </svg>
              </div>
            ) : null}
          </>
        ) : (
          <p className="mt-6 text-sm text-ink-400">Loading activity streams…</p>
        )}
      </GlassCard>
    </div>
  );
}
