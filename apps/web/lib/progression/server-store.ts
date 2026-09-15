import { resolveCanonicalLevel } from "@/lib/ascend/canonical-levels";
import { DEFAULT_PROGRESSION_XP, xpForProgressionEvent } from "@/lib/progression/xp";

/**
 * IN_MEMORY_DEMO adapter — process-local Map.
 * Canonical activity-derived XP write/read path is
 * `apps/web/lib/progression/supabase-repository.ts` → public.ascend_events / ascend_progress.
 * Do not use this store as production SoT. Pending removal after P4-ASCEND.
 */

export type ProgressionEventType = "WORKOUT_COMPLETED" | "MISSION_COMPLETED";

export type ProgressionEvent = {
  eventId: string;
  type: ProgressionEventType;
  xpAward?: number;
  payload?: {
    distanceM?: number;
    durationMs?: number;
    elevationGainM?: number;
    /** Canonical activities.id when awarding from a workout */
    sessionId?: string;
    workoutId?: string;
  };
};

export type ProgressionSnapshot = {
  userId: string;
  totalXp: number;
  level: ReturnType<typeof resolveCanonicalLevel>;
  streakDays: number;
  badges: string[];
  processedEventIds: string[];
  updatedAt: string;
};

type UserState = {
  totalXp: number;
  streakDays: number;
  badges: string[];
  eventIds: Set<string>;
  updatedAt: string;
};

const users = new Map<string, UserState>();

function defaultState(): UserState {
  return {
    totalXp: DEFAULT_PROGRESSION_XP,
    streakDays: 0,
    badges: [],
    eventIds: new Set(),
    updatedAt: new Date().toISOString()
  };
}

function snapshot(userId: string, state: UserState): ProgressionSnapshot {
  return {
    userId,
    totalXp: state.totalXp,
    level: resolveCanonicalLevel(state.totalXp),
    streakDays: state.streakDays,
    badges: [...state.badges],
    processedEventIds: [...state.eventIds],
    updatedAt: state.updatedAt
  };
}

export function getProgression(userId: string): ProgressionSnapshot {
  const state = users.get(userId) ?? defaultState();
  if (!users.has(userId)) users.set(userId, state);
  return snapshot(userId, state);
}

function xpForEvent(event: ProgressionEvent): number {
  return xpForProgressionEvent(event);
}

export type ApplyEventResult = {
  status: "APPLIED" | "DUPLICATE";
  awardedXp: number;
  snapshot: ProgressionSnapshot;
  leveledUp: boolean;
};

export function applyProgressionEvent(
  userId: string,
  event: ProgressionEvent
): ApplyEventResult {
  const state = users.get(userId) ?? defaultState();
  if (!users.has(userId)) users.set(userId, state);

  if (state.eventIds.has(event.eventId)) {
    return {
      status: "DUPLICATE",
      awardedXp: 0,
      snapshot: snapshot(userId, state),
      leveledUp: false
    };
  }

  const prevLevel = resolveCanonicalLevel(state.totalXp).level;
  const awardedXp = xpForEvent(event);
  state.totalXp += awardedXp;
  state.eventIds.add(event.eventId);
  state.updatedAt = new Date().toISOString();
  users.set(userId, state);

  const next = snapshot(userId, state);
  return {
    status: "APPLIED",
    awardedXp,
    snapshot: next,
    leveledUp: next.level.level > prevLevel
  };
}

export function patchProgression(
  userId: string,
  patch: { totalXp?: number; streakDays?: number; badges?: string[] }
): ProgressionSnapshot {
  const state = users.get(userId) ?? defaultState();
  if (typeof patch.totalXp === "number") state.totalXp = Math.max(0, patch.totalXp);
  if (typeof patch.streakDays === "number") state.streakDays = Math.max(0, patch.streakDays);
  if (patch.badges) state.badges = [...patch.badges];
  state.updatedAt = new Date().toISOString();
  users.set(userId, state);
  return snapshot(userId, state);
}

export function resetProgressionForTests() {
  users.clear();
}
