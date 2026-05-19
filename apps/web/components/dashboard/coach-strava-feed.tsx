"use client";

import { useEffect, useState } from "react";
import { getSportMeta } from "@fitconnect/types";
import { PremiumCard, SectionHeader } from "@/components/ui-glass/premium-system";
import { StravaActivityMap } from "@/components/dashboard/strava-activity-map";
import Link from "next/link";

type ActivityRow = {
  id: string;
  name: string;
  sportType: string;
  distanceM: number;
  movingTimeSec: number;
  startDate: string;
  avgHr?: number;
  mapPolyline?: string;
  athleteName?: string;
};

export function CoachStravaFeed({ coachId }: { coachId: string }) {
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void fetch(`/api/v1/integrations/strava/coach?coachId=${encodeURIComponent(coachId)}`)
      .then((r) => (r.ok ? r.json() : { activities: [] }))
      .then((d: { activities: ActivityRow[] }) => setActivities(d.activities ?? []))
      .finally(() => setLoaded(true));
  }, [coachId]);

  if (!loaded) return null;

  if (!activities.length) {
    return (
      <section className="space-y-4">
        <SectionHeader
          eyebrow="Strava import"
          title="Athlete activities"
          body="When athletes connect Strava, their workouts appear here automatically."
        />
        <PremiumCard tone="neutral" className="p-6 text-center">
          <p className="text-sm text-ink-400">
            No Strava activities yet. Ask your roster to connect Strava from their
            integrations hub.
          </p>
          <Link
            href="/dashboard?demo=1"
            className="mt-4 inline-block text-sm font-semibold text-brand-300 hover:text-brand-200"
          >
            Open athlete demo →
          </Link>
        </PremiumCard>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <SectionHeader
        eyebrow="Strava import"
        title="Athlete activities"
        body="Recent workouts synced from Strava across your roster."
      />
      <div className="grid gap-3 lg:grid-cols-2">
        {activities.slice(0, 6).map((a) => {
          const meta = getSportMeta(a.sportType);
          return (
            <PremiumCard key={a.id} tone="brand" className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-300">
                    {a.athleteName ?? "Athlete"} · {meta.labelPt}
                  </p>
                  <p className="font-display text-lg font-bold text-ink-50">{a.name}</p>
                  <p className="text-xs text-ink-400">
                    {(a.distanceM / 1000).toFixed(1)} km · {Math.round(a.movingTimeSec / 60)} min
                    {a.avgHr ? ` · ${Math.round(a.avgHr)} bpm` : ""}
                  </p>
                </div>
                <span className="text-xl" aria-hidden>
                  {meta.icon}
                </span>
              </div>
              <StravaActivityMap polyline={a.mapPolyline} />
            </PremiumCard>
          );
        })}
      </div>
    </section>
  );
}
