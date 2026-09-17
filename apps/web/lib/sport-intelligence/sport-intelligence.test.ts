import { describe, expect, it } from "vitest";
import {
  listSports,
  getSport,
  sportFromLegacyTrainSport,
  isValidSessionType
} from "./sport-registry";
import { adaptTodaySession } from "./adaptation-engine";
import { emptySportsIdentity } from "./sports-identity";
import { suggestProgression } from "./progression-engine";
import { startRest, remainingSec, adjustRest, pauseRest, resumeRest } from "./rest-timer";
import { composeSession, sortBlocks } from "./session-composer";

describe("sport registry", () => {
  it("registers extensible sports without UI hardcoding", () => {
    expect(listSports().length).toBeGreaterThanOrEqual(20);
    expect(getSport("RUNNING").sessionTypes).toContain("threshold");
    expect(getSport("MARTIAL_ARTS").safetyConstraints.join(" ")).toMatch(/dehydration|weight cut/i);
  });

  it("maps legacy train sports", () => {
    expect(sportFromLegacyTrainSport("running")).toBe("RUNNING");
    expect(sportFromLegacyTrainSport("martial_arts")).toBe("MARTIAL_ARTS");
  });

  it("validates session types per sport", () => {
    expect(isValidSessionType("CYCLING", "sweet_spot")).toBe(true);
    expect(isValidSessionType("CYCLING", "sparring")).toBe(false);
  });
});

describe("adaptation engine", () => {
  it("explains catalog fallback when readiness missing", () => {
    const profile = emptySportsIdentity("u1");
    profile.primarySport = "RUNNING";
    const card = adaptTodaySession({
      profile,
      readiness: {
        score: null,
        band: null,
        source: "unauthorized",
        available: false,
        detail: "none"
      },
      recentPlanIds: []
    });
    expect(card.sportId).toBe("RUNNING");
    expect(card.readinessState).toBe("ERROR");
    expect(card.session.explanation.why).toMatch(/No reliable recovery signal/i);
    expect(card.session.blocks.some((b) => b.kind === "WARMUP")).toBe(true);
    expect(card.fuelingHint.length).toBeGreaterThan(10);
  });

  it("adapts intensity when readiness available", () => {
    const profile = emptySportsIdentity("u1");
    profile.primarySport = "STRENGTH";
    const card = adaptTodaySession({
      profile,
      readiness: {
        score: 88,
        band: "READY",
        source: "health_connect",
        available: true,
        detail: "ok"
      },
      recentPlanIds: []
    });
    expect(card.adapted).toBe(true);
    expect(card.readinessState).toBe("AVAILABLE");
    expect(card.readinessScore).toBe(88);
    expect(card.session.explanation.dataUsed.some((d) => d.startsWith("readiness:"))).toBe(true);
  });
});

describe("progression engine", () => {
  it("never auto-applies deload", () => {
    const s = suggestProgression({
      strategy: "AUTO_DELOAD",
      previousLoadKg: 100,
      previousReps: 5,
      targetRepsMin: 3,
      targetRepsMax: 5,
      previousTimeSec: null,
      previousDistanceM: null,
      previousPaceSecPerKm: null,
      previousPowerW: null,
      readinessBand: "RECOVER",
      suggestDeload: true
    });
    expect(s.deloadSuggested).toBe(true);
    expect(s.explanation).toMatch(/Not applied automatically/i);
    expect(s.nextLoadKg).toBe(90);
  });

  it("double progression bumps load at top of range", () => {
    const s = suggestProgression({
      strategy: "DOUBLE_PROGRESSION",
      previousLoadKg: 60,
      previousReps: 12,
      targetRepsMin: 8,
      targetRepsMax: 12,
      previousTimeSec: null,
      previousDistanceM: null,
      previousPaceSecPerKm: null,
      previousPowerW: null,
      readinessBand: "READY"
    });
    expect(s.nextLoadKg).toBe(62.5);
    expect(s.nextReps).toBe(8);
  });
});

describe("rest timer", () => {
  it("uses wall-clock remaining and never goes negative", () => {
    const t0 = 1_000_000;
    const state = startRest(90, t0);
    expect(remainingSec(state, t0)).toBe(90);
    expect(remainingSec(state, t0 + 30_000)).toBe(60);
    expect(remainingSec(state, t0 + 120_000)).toBe(0);
    const paused = pauseRest(state, t0 + 10_000);
    expect(remainingSec(paused, t0 + 50_000)).toBe(80);
    const resumed = resumeRest(paused, t0 + 50_000);
    expect(remainingSec(resumed, t0 + 50_000)).toBe(80);
    const adj = adjustRest(resumed, -15, t0 + 50_000);
    expect(remainingSec(adj, t0 + 50_000)).toBe(65);
  });
});

describe("session composer", () => {
  it("sorts blocks deterministically", () => {
    const session = composeSession({
      sportId: "STRENGTH",
      sessionType: "hypertrophy",
      intent: "push",
      durationMin: 45,
      equipment: ["dumbbell"],
      blocks: [
        { id: "c", kind: "COOLDOWN", title: "C" },
        { id: "w", kind: "WARMUP", title: "W" },
        { id: "m", kind: "MAIN", title: "M" }
      ],
      explanation: {
        what: "test",
        why: "unit",
        dataUsed: [],
        confidence: "HIGH"
      }
    });
    const sorted = sortBlocks(session.blocks);
    expect(sorted.map((b) => b.kind)).toEqual(["WARMUP", "MAIN", "COOLDOWN"]);
  });
});
