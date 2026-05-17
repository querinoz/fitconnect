"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/lib/auth-store";
import {
  selectAthlete,
  selectAthletesForCoach,
  selectCoachMetrics,
  selectHabitsForAthlete,
  selectMessagesForAthlete,
  selectMessagesForCoach,
  selectPlanForAthlete,
  selectSessionsForAthlete,
  selectSessionsForCoach,
  useDashboardStore
} from "@/lib/dashboard-store";
import { DEMO_ATHLETE_ID } from "@/lib/dashboard/seed";
import { getTrainerById } from "@/lib/dashboard/seed";

export function useAthleteContext(overrideId?: string) {
  const user = useAuthStore((s) => s.user);
  const athleteId =
    overrideId ?? user?.athleteId ?? (user?.role === "admin" ? DEMO_ATHLETE_ID : "");

  const state = useDashboardStore();
  return useMemo(() => {
    const athlete = selectAthlete(state, athleteId);
    const plan = selectPlanForAthlete(state, athleteId);
    const coach = athlete ? getTrainerById(athlete.coachId) : undefined;
    return {
      athleteId,
      athlete,
      plan,
      coach,
      sessions: selectSessionsForAthlete(state, athleteId),
      messages: selectMessagesForAthlete(state, athleteId),
      habits: selectHabitsForAthlete(state, athleteId),
      weeklyVolume: state.weeklyVolume,
      monthlyTrend: state.monthlyTrend,
      sleepWeek: state.sleepWeek,
      toggleHabit: state.toggleHabit,
      togglePlanBlock: state.togglePlanBlock
    };
  }, [state, athleteId]);
}

export function useCoachContext() {
  const user = useAuthStore((s) => s.user);
  const coachId = user?.coachId ?? "t-001";

  const state = useDashboardStore();
  return useMemo(() => {
    const roster = selectAthletesForCoach(state, coachId);
    const metrics = selectCoachMetrics(state, coachId);
    return {
      coachId,
      roster,
      metrics,
      sessions: selectSessionsForCoach(state, coachId),
      messages: selectMessagesForCoach(state, coachId),
      revenueWeekly: state.revenueWeekly,
      retentionTrend: state.retentionTrend,
      plans: state.plans.filter((p) => p.coachId === coachId),
      togglePlanBlock: state.togglePlanBlock,
      updatePlanSuggestion: state.updatePlanSuggestion,
      markMessageRead: state.markMessageRead
    };
  }, [state, coachId]);
}
