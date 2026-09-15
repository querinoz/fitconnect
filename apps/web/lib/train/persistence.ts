import type { LoggedSet, TrainSnapshot } from "./types";
import { IDLE_SNAPSHOT } from "./machine";

export const TRAIN_SESSION_KEY = "fitconnect.train.session.v1";
export const TRAIN_HISTORY_KEY = "fitconnect.train.history.v1";

export type HistorySet = {
  exerciseId: string;
  name: string;
  reps: number | null;
  loadKg: number | null;
  rpe: number | null;
};

export type LocalTrainHistoryItem = {
  sessionId: string;
  planId: string;
  completedAtMs: number;
  durationMs: number;
  sets: number;
  volumeKg: number;
  saveStatus: TrainSnapshot["saveStatus"];
  bestSets: HistorySet[];
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function persistTrainSnapshot(snapshot: TrainSnapshot): void {
  if (!canUseStorage()) return;
  try {
    if (snapshot.phase === "idle") {
      window.localStorage.removeItem(TRAIN_SESSION_KEY);
      return;
    }
    window.localStorage.setItem(TRAIN_SESSION_KEY, JSON.stringify(snapshot));
  } catch {
    // Private mode / quota — session continues in memory.
  }
}

export function loadTrainSnapshot(): TrainSnapshot | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(TRAIN_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TrainSnapshot;
    if (!parsed?.phase) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearTrainSnapshot(): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(TRAIN_SESSION_KEY);
  } catch {
    // ignore
  }
}

export function setsForHistory(sets: LoggedSet[]): HistorySet[] {
  return sets
    .filter((set) => !set.skipped)
    .map((set) => ({
      exerciseId: set.exerciseId,
      name: set.name,
      reps: set.reps,
      loadKg: set.loadKg,
      rpe: set.rpe
    }));
}

export function bestSetFromHistory(
  history: LocalTrainHistoryItem[],
  exerciseId: string,
  excludeSessionId?: string
): HistorySet | null {
  let best: HistorySet | null = null;
  let bestScore = -1;
  for (const item of history) {
    if (excludeSessionId && item.sessionId === excludeSessionId) continue;
    for (const set of item.bestSets ?? []) {
      if (set.exerciseId !== exerciseId) continue;
      const score = (set.reps ?? 0) * (set.loadKg ?? 0);
      const fallback = set.reps ?? 0;
      const value = score > 0 ? score : fallback;
      if (value > bestScore) {
        bestScore = value;
        best = set;
      }
    }
  }
  return best;
}

export function devicePrs(
  current: LoggedSet[],
  history: LocalTrainHistoryItem[],
  sessionId: string
): string[] {
  const names = new Set<string>();
  for (const set of current) {
    if (set.skipped || set.reps == null) continue;
    const previous = bestSetFromHistory(history, set.exerciseId, sessionId);
    const currentScore = set.reps * (set.loadKg ?? 0);
    const previousScore = previous ? (previous.reps ?? 0) * (previous.loadKg ?? 0) : 0;
    if (previous && currentScore > previousScore && currentScore > 0) {
      names.add(set.name);
    }
  }
  return [...names];
}

export function recordLocalHistory(item: LocalTrainHistoryItem): void {
  if (!canUseStorage()) return;
  try {
    const current = listLocalHistory();
    const next = [item, ...current.filter((row) => row.sessionId !== item.sessionId)].slice(0, 20);
    window.localStorage.setItem(TRAIN_HISTORY_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function listLocalHistory(): LocalTrainHistoryItem[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(TRAIN_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalTrainHistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function emptySnapshot(): TrainSnapshot {
  return { ...IDLE_SNAPSHOT };
}
