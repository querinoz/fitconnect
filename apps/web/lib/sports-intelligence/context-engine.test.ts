import { describe, expect, it, beforeEach } from "vitest";
import {
  ingestAthleteEvent,
  __resetAthleteEventStore,
  listAthleteEvents
} from "./event-store";
import { buildAthleteContext, suggestLiveAdaptation } from "./context-engine";
import { computeTrainingLoad } from "./training-load";

describe("V10 event store", () => {
  beforeEach(() => {
    __resetAthleteEventStore();
  });

  it("rejects duplicate events via dedupeKey", () => {
    const a = ingestAthleteEvent({
      type: "WORKOUT_STARTED",
      timestamp: "2026-09-18T10:00:00.000Z",
      userId: "u1",
      source: "TRAIN",
      dedupeKey: "session:abc:start",
      payload: { sessionId: "abc" }
    });
    const b = ingestAthleteEvent({
      type: "WORKOUT_STARTED",
      timestamp: "2026-09-18T10:00:00.000Z",
      userId: "u1",
      source: "TRAIN",
      dedupeKey: "session:abc:start",
      payload: { sessionId: "abc" }
    });
    expect(a.ok && !a.duplicate).toBe(true);
    expect(b.ok && b.duplicate).toBe(true);
    expect(listAthleteEvents("u1")).toHaveLength(1);
  });
});

describe("V10 training load", () => {
  it("returns MISSING without sessions", () => {
    const load = computeTrainingLoad([]);
    expect(load.provenance).toBe("MISSING");
    expect(load.label).toBe("UNKNOWN");
  });

  it("computes ACWR from strain history", () => {
    const sessions = [];
    for (let i = 0; i < 28; i++) {
      const d = new Date("2026-09-18T12:00:00.000Z");
      d.setUTCDate(d.getUTCDate() - i);
      sessions.push({ dateISO: d.toISOString().slice(0, 10), strain: 50 });
    }
    // Spike last 7 days
    for (let i = 0; i < 7; i++) {
      sessions[i]!.strain = 120;
    }
    const load = computeTrainingLoad(sessions, new Date("2026-09-18T12:00:00.000Z"));
    expect(load.provenance).toBe("CALCULATED");
    expect(load.acwr).not.toBeNull();
    expect(load.acwr!).toBeGreaterThan(1);
  });
});

describe("V10 context engine", () => {
  beforeEach(() => {
    __resetAthleteEventStore();
  });

  it("builds context without inventing HR", () => {
    ingestAthleteEvent({
      type: "WORKOUT_STARTED",
      timestamp: "2026-09-18T10:00:00.000Z",
      userId: "u1",
      source: "TRAIN",
      payload: { sessionId: "s1" }
    });
    const events = listAthleteEvents("u1");
    const ctx = buildAthleteContext({ userId: "u1", events, primarySport: "RUNNING" });
    expect(ctx.training.phase).toBe("ACTIVE");
    expect(ctx.metrics.heartRate?.provenance).toBe("MISSING");
    expect(ctx.metrics.heartRate?.value).toBeNull();
  });

  it("marks stale HR and suggests caution without auto-mutate", () => {
    const staleTs = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    ingestAthleteEvent({
      type: "WORKOUT_STARTED",
      timestamp: new Date().toISOString(),
      userId: "u1",
      source: "TRAIN",
      payload: { sessionId: "s1" }
    });
    ingestAthleteEvent({
      type: "HEART_RATE_UPDATED",
      timestamp: staleTs,
      userId: "u1",
      source: "WEAROS",
      payload: { bpm: 150 }
    });
    const ctx = buildAthleteContext({ userId: "u1", events: listAthleteEvents("u1") });
    expect(ctx.metrics.heartRate?.freshness).toBe("STALE");
    expect(ctx.safety.flags).toContain("STALE_HEART_RATE");
    const suggestion = suggestLiveAdaptation(ctx);
    expect(suggestion.requiresConfirm).toBe(true);
    expect(suggestion.action).not.toBe("NONE");
  });
});
