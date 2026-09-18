/**
 * Idempotent athlete event store — in-memory with optional append-only memory persistence.
 * Supports duplicate rejection, ordered read, and replay by user.
 */

import {
  type AthleteEvent,
  computeDedupeKey,
  ATHLETE_EVENT_SCHEMA_VERSION,
  createEventId
} from "./events";

const byUser = new Map<string, AthleteEvent[]>();
const dedupeIndex = new Map<string, string>(); // dedupeKey → eventId

export type IngestResult =
  | { ok: true; event: AthleteEvent; duplicate: false }
  | { ok: true; event: AthleteEvent; duplicate: true }
  | { ok: false; error: string };

export function ingestAthleteEvent(
  input: Omit<AthleteEvent, "id" | "schemaVersion"> & { id?: string; schemaVersion?: string }
): IngestResult {
  if (!input.userId || !input.type || !input.timestamp || !input.source) {
    return { ok: false, error: "invalid_event" };
  }

  const event: AthleteEvent = {
    id: input.id ?? createEventId(),
    type: input.type,
    timestamp: input.timestamp,
    userId: input.userId,
    source: input.source,
    schemaVersion: input.schemaVersion ?? ATHLETE_EVENT_SCHEMA_VERSION,
    device: input.device,
    dedupeKey: input.dedupeKey,
    payload: input.payload ?? {}
  };

  const key = computeDedupeKey(event);
  const existingId = dedupeIndex.get(key);
  if (existingId) {
    const existing = (byUser.get(event.userId) ?? []).find((e) => e.id === existingId);
    if (existing) {
      return { ok: true, event: existing, duplicate: true };
    }
  }

  const list = byUser.get(event.userId) ?? [];
  list.push(event);
  list.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  byUser.set(event.userId, list);
  dedupeIndex.set(key, event.id);
  return { ok: true, event, duplicate: false };
}

export function listAthleteEvents(userId: string, opts?: { since?: string; limit?: number }): AthleteEvent[] {
  let list = byUser.get(userId) ?? [];
  if (opts?.since) {
    list = list.filter((e) => e.timestamp >= opts.since!);
  }
  const limit = opts?.limit ?? 200;
  return list.slice(-limit);
}

export function replayAthleteEvents(userId: string): AthleteEvent[] {
  return [...(byUser.get(userId) ?? [])];
}

/** Test / demo reset — never call from production request paths casually */
export function __resetAthleteEventStore(): void {
  byUser.clear();
  dedupeIndex.clear();
}
