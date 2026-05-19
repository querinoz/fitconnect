"use client";

import { useMemo } from "react";
import type { SessionSummary } from "@fitconnect/types";
import {
  selectSessionsForAthlete,
  useDashboardStore
} from "@/lib/dashboard-store";
import { useShallow } from "zustand/react/shallow";

export function useAthleteSessions(athleteId: string | undefined) {
  const sessions = useDashboardStore(
    useShallow((s) =>
      athleteId ? selectSessionsForAthlete(s, athleteId) : []
    )
  );

  const mapped = useMemo<SessionSummary[]>(
    () =>
      sessions.map((s) => ({
        id: s.id,
        athleteId: s.athleteId,
        coachId: s.coachId,
        when: s.when,
        type: s.type,
        mode: s.mode,
        intensity: s.intensity,
        status: s.status ?? "scheduled"
      })),
    [sessions]
  );

  return { sessions: mapped, loading: !athleteId };
}
