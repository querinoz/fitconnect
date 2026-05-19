"use client";

import { create } from "zustand";
import { initialDashboardState } from "./dashboard/seed";
import type {
  CoachPlan,
  DashboardAthlete,
  DashboardState,
  HabitItem,
  LiveSessionIntent,
  PlanBlock
} from "./dashboard/types";
import { computeReadiness } from "./readiness/compute";
import type { AICoPilotAlert, LiveTick, Reaction } from "./realtime/types";

type DashboardStore = DashboardState & {
  toggleHabit: (habitId: string) => void;
  togglePlanBlock: (planId: string, blockId: string) => void;
  updatePlanSuggestion: (planId: string, suggestion: string) => void;
  markMessageRead: (messageId: string) => void;
  resetDemo: () => void;
  startLiveSession: (athleteId: string, intent: LiveSessionIntent) => void;
  endLiveSession: (athleteId: string) => void;
  appendLiveTick: (athleteId: string, tick: LiveTick) => void;
  addReaction: (achievementId: string, r: Reaction) => void;
  pushAIAlert: (a: AICoPilotAlert) => void;
  dismissAIAlert: (id: string) => void;
  applyPlanDiff: (
    planId: string,
    diff: "lighter-day" | "swap-z2" | "add-recovery"
  ) => void;
  cancelSession: (sessionId: string) => void;
  rescheduleSession: (sessionId: string, when: string) => void;
  updateAthleteProfile: (
    athleteId: string,
    patch: Partial<
      Pick<
        DashboardAthlete,
        "goalTitle" | "goalProgress" | "sports" | "sleepHours"
      >
    >
  ) => void;
  ingestHrvReading: (athleteId: string, hrvMs: number) => void;
  setPlanBlocks: (planId: string, blocks: PlanBlock[]) => void;
};

/** In-memory demo store — no persist middleware (avoids Next.js hydration loops). */
export const useDashboardStore = create<DashboardStore>()((set, get) => ({
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
          ? {
              ...p,
              aiSuggestion: suggestion,
              updatedAt: new Date().toISOString()
            }
          : p
      )
    })),
  markMessageRead: (messageId) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId ? { ...m, unread: false } : m
      )
    })),
  resetDemo: () => set({ ...initialDashboardState }),
  startLiveSession: (athleteId, intent) =>
    set((s) => ({
      liveSessions: {
        ...s.liveSessions,
        [athleteId]: {
          athleteId,
          intent,
          startedAt: new Date().toISOString(),
          ticks: []
        }
      }
    })),
  endLiveSession: (athleteId) =>
    set((s) => {
      const cur = s.liveSessions[athleteId];
      if (!cur) return {};
      return {
        liveSessions: {
          ...s.liveSessions,
          [athleteId]: { ...cur, endedAt: new Date().toISOString() }
        }
      };
    }),
  appendLiveTick: (athleteId, tick) =>
    set((s) => {
      const cur = s.liveSessions[athleteId];
      if (!cur) return {};
      return {
        liveSessions: {
          ...s.liveSessions,
          [athleteId]: { ...cur, ticks: [...cur.ticks, tick] }
        }
      };
    }),
  addReaction: (achievementId, r) =>
    set((s) => ({
      reactions: {
        ...s.reactions,
        [achievementId]: [...(s.reactions[achievementId] ?? []), r]
      }
    })),
  pushAIAlert: (a) => {
    const existing = get().aiAlerts;
    if (existing.some((x) => x.id === a.id)) return;
    set({ aiAlerts: [a, ...existing] });
  },
  dismissAIAlert: (id) =>
    set((s) => ({
      aiAlerts: s.aiAlerts.filter((alert) => alert.id !== id)
    })),
  applyPlanDiff: (planId, diff) =>
    set((s) => ({
      plans: s.plans.map((p) => {
        if (p.id !== planId) return p;
        const blocks = p.blocks.map((b, i) => {
          if (i !== 0) return b;
          if (diff === "lighter-day")
            return { ...b, intensity: "Light · RPE 4" };
          if (diff === "swap-z2")
            return { ...b, title: "Z2 base · 45 min", intensity: "Z2 · RPE 5" };
          if (diff === "add-recovery")
            return { ...b, title: "Active recovery", intensity: "Recovery · RPE 2" };
          return b;
        });
        return { ...p, blocks, updatedAt: new Date().toISOString() };
      })
    })),
  cancelSession: (sessionId) =>
    set((s) => ({
      sessions: s.sessions.map((sess) =>
        sess.id === sessionId ? { ...sess, status: "cancelled" as const } : sess
      )
    })),
  rescheduleSession: (sessionId, when) =>
    set((s) => ({
      sessions: s.sessions.map((sess) =>
        sess.id === sessionId ? { ...sess, when, status: "scheduled" as const } : sess
      )
    })),
  updateAthleteProfile: (athleteId, patch) =>
    set((s) => ({
      athletes: s.athletes.map((a) =>
        a.id === athleteId ? { ...a, ...patch } : a
      )
    })),
  ingestHrvReading: (athleteId, hrvMs) =>
    set((s) => ({
      athletes: s.athletes.map((a) => {
        if (a.id !== athleteId) return a;
        const sleepHours = Number.parseFloat(a.sleepHours) || 7.5;
        const readiness = computeReadiness({
          hrvMs,
          baselineHrvMs: Math.max(58, a.hrv - 4),
          sleepHours,
          sleepEfficiency: a.sleepEfficiency,
          strainScore:
            a.recoveryStatus === "red" ? 72 : a.recoveryStatus === "amber" ? 48 : 28
        });
        return {
          ...a,
          hrv: hrvMs,
          readiness: readiness.score,
          recoveryStatus: readiness.recoveryStatus
        };
      })
    })),
  setPlanBlocks: (planId, blocks) =>
    set((s) => ({
      plans: s.plans.map((p) =>
        p.id === planId
          ? { ...p, blocks, updatedAt: new Date().toISOString() }
          : p
      )
    }))
}));

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

export type {
  CoachPlan,
  LiveSessionIntent,
  PlanBlock,
  HabitItem
};
