import type { TrainSnapshot } from "./types";
import { IDLE_SNAPSHOT } from "./machine";

export const TRAIN_SESSION_KEY = "fitconnect.train.session.v1";
export const TRAIN_HISTORY_KEY = "fitconnect.train.history.v1";

export type LocalTrainHistoryItem = {
  sessionId: string;
  planId: string;
  completedAtMs: number;
  durationMs: number;
  sets: number;
  saveStatus: TrainSnapshot["saveStatus"];
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function persistTrainSnapshot(snapshot: TrainSnapshot): void {
  if (!canUseStorage()) return;
  try {
    if (snapshot.phase === "idle" || snapshot.phase === "complete") {
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
