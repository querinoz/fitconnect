"use client";

import { useEffect, useState } from "react";
import { computeReadiness } from "@/lib/readiness/compute";
import { useDashboardStore, selectAthlete } from "@/lib/dashboard-store";
import { DEMO_ATHLETE_ID } from "@/lib/dashboard/seed";

type ReadinessState = {
  score: number;
  source: "demo" | "strava" | "api";
  loading: boolean;
};

/** Fetches readiness from API when Strava connected; falls back to demo store. */
export function useAthleteReadiness(athleteId: string = DEMO_ATHLETE_ID): ReadinessState {
  const athlete = useDashboardStore((s) => selectAthlete(s, athleteId));
  const [state, setState] = useState<ReadinessState>({
    score: athlete?.readiness ?? 0,
    source: "demo",
    loading: true
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const statusRes = await fetch(
          `/api/v1/integrations/status?athleteId=${encodeURIComponent(athleteId)}`
        );
        const status = (await statusRes.json()) as {
          providers: { id: string; status: string }[];
          strava?: { connected?: boolean };
        };
        const stravaConnected =
          status.strava?.connected ||
          status.providers.some((p) => p.id === "strava" && p.status === "connected");

        if (stravaConnected) {
          await fetch("/api/v1/integrations/strava/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ athleteId })
          }).catch(() => undefined);
        }

        const readinessRes = await fetch(
          `/api/v1/readiness?athleteId=${encodeURIComponent(athleteId)}`
        ).catch(() => null);

        if (readinessRes?.ok) {
          const data = (await readinessRes.json()) as { score?: number };
          if (!cancelled && typeof data.score === "number") {
            setState({
              score: data.score,
              source: stravaConnected ? "strava" : "api",
              loading: false
            });
            return;
          }
        }

        if (!cancelled && athlete) {
          const baselineHrv = Math.max(58, athlete.hrv - 4);
          const result = computeReadiness({
            hrvMs: athlete.hrv,
            baselineHrvMs: baselineHrv,
            sleepHours: Number.parseFloat(athlete.sleepHours) || 7.5,
            sleepEfficiency: athlete.sleepEfficiency,
            strainScore:
              athlete.recoveryStatus === "red"
                ? 72
                : athlete.recoveryStatus === "amber"
                  ? 48
                  : 28
          });
          setState({
            score: result.score,
            source: stravaConnected ? "strava" : "demo",
            loading: false
          });
        }
      } catch {
        if (!cancelled) {
          setState((s) => ({ ...s, loading: false }));
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [athleteId, athlete?.hrv, athlete?.readiness, athlete]);

  return state;
}
