"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { initialDashboardState } from "./dashboard/seed";
import type { CoachPlan, DashboardState, HabitItem, PlanBlock } from "./dashboard/types";

type DashboardStore = DashboardState & {
  toggleHabit: (habitId: string) => void;
  togglePlanBlock: (planId: string, blockId: string) => void;
  updatePlanSuggestion: (planId: string, suggestion: string) => void;
  markMessageRead: (messageId: string) => void;
  resetDemo: () => void;
};

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      ...initialDashboardState,
      toggleHabit: (habitId) =>
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === habitId ? { ...h, done: !h.done } : h
          )
        })),
      togglePlanBlock: (planId, blockId) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id === planId
              ? {
                  ...p,
                  blocks: p.blocks.map((b) =>
                    b.id === blockId ? { ...b, completed: !b.completed } : b
                  ),
                  updatedAt: new Date().toISOString()
                }
              : p
          )
        })),
      updatePlanSuggestion: (planId, suggestion) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id === planId
              ? { ...p, aiSuggestion: suggestion, updatedAt: new Date().toISOString() }
              : p
          )
        })),
      markMessageRead: (messageId) =>
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === messageId ? { ...m, unread: false } : m
          )
        })),
      resetDemo: () => set({ ...initialDashboardState })
    }),
    { name: "fitconnect-dashboard" }
  )
);

export function selectAthlete(state: DashboardState, athleteId: string) {
  return state.athletes.find((a) => a.id === athleteId);
}

export function selectAthletesForCoach(state: DashboardState, coachId: string) {
  return state.athletes.filter((a) => a.coachId === coachId);
}

export function selectPlanForAthlete(state: DashboardState, athleteId: string) {
  return state.plans.find((p) => p.athleteId === athleteId);
}

export function selectSessionsForAthlete(state: DashboardState, athleteId: string) {
  return state.sessions.filter((s) => s.athleteId === athleteId);
}

export function selectSessionsForCoach(state: DashboardState, coachId: string) {
  return state.sessions.filter((s) => s.coachId === coachId);
}

export function selectMessagesForAthlete(state: DashboardState, athleteId: string) {
  return state.messages.filter((m) => m.athleteId === athleteId);
}

export function selectMessagesForCoach(state: DashboardState, coachId: string) {
  return state.messages.filter((m) => m.coachId === coachId);
}

export function selectHabitsForAthlete(state: DashboardState, athleteId: string) {
  return state.habits.filter((h) => h.athleteId === athleteId);
}

export function selectCoachMetrics(state: DashboardState, coachId: string) {
  return (
    state.coachMetrics.find((m) => m.coachId === coachId) ??
    state.coachMetrics[0]
  );
}

export type { CoachPlan, PlanBlock, HabitItem };
