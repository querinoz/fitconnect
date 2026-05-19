import { MMKV } from "react-native-mmkv";

export const cache = new MMKV({ id: "fitconnect-cache" });

const KEYS = {
  readiness: "cache:readiness",
  hrv: "cache:hrv",
  sessions: "cache:sessions",
  syncedAt: "cache:synced-at"
} as const;

export type CachedReadiness = {
  score: number;
  label: string;
  hrvMs: number;
  sleepHours: number;
  strain: number;
};

export function writeReadinessCache(data: CachedReadiness) {
  cache.set(KEYS.readiness, JSON.stringify(data));
  cache.set(KEYS.syncedAt, new Date().toISOString());
}

export function readReadinessCache(): CachedReadiness | null {
  const raw = cache.getString(KEYS.readiness);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CachedReadiness;
  } catch {
    return null;
  }
}

export function writeSessionsCache<T>(sessions: T[]) {
  cache.set(KEYS.sessions, JSON.stringify(sessions));
}

export function readSessionsCache<T>(): T[] {
  const raw = cache.getString(KEYS.sessions);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

export function lastSyncedLabel(): string | null {
  return cache.getString(KEYS.syncedAt) ?? null;
}
