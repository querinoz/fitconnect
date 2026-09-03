/**
 * P1-DATA unit contracts — canonical units, Strava shareable barrier, XP idempotency keys.
 */
import { describe, expect, it } from "vitest";
import {
  ACTIVITY_UNITS,
  READINESS_UNITS,
  kjToKcal,
  kcalToKj,
  type CanonicalActivity,
  type CanonicalIdentityKeys,
  type CanonicalXpEvent
} from "@fitconnect/types";
import {
  canSelectWorkoutSession,
  isShareableProvider
} from "@/lib/fitness/workout-session-policy";

describe("P1-DATA canonical units", () => {
  it("declares unambiguous storage units", () => {
    expect(ACTIVITY_UNITS.distance).toBe("m");
    expect(ACTIVITY_UNITS.duration).toBe("ms");
    expect(ACTIVITY_UNITS.calories).toBe("kcal");
    expect(ACTIVITY_UNITS.heartRate).toBe("bpm");
    expect(ACTIVITY_UNITS.timestamp).toBe("timestamptz_utc");
    expect(READINESS_UNITS.hrv).toBe("ms_rmssd");
  });

  it("converts legacy kJ ↔ kcal without ambiguity", () => {
    expect(kjToKcal(418.4)).toBeCloseTo(100, 5);
    expect(kcalToKj(100)).toBeCloseTo(418.4, 5);
  });
});

describe("P1-DATA activity shareable / Strava barrier", () => {
  it("denies third-party Strava public rows", () => {
    expect(
      canSelectWorkoutSession("user-b", {
        userId: "user-a",
        provider: "STRAVA",
        visibility: "public",
        shareable: false
      })
    ).toBe(false);
    expect(isShareableProvider("STRAVA")).toBe(false);
    expect(isShareableProvider("strava")).toBe(false);
  });

  it("allows owner Strava and public Health Connect", () => {
    expect(
      canSelectWorkoutSession("user-a", {
        userId: "user-a",
        provider: "STRAVA",
        visibility: "public"
      })
    ).toBe(true);
    expect(
      canSelectWorkoutSession("user-b", {
        userId: "user-a",
        provider: "HEALTH_CONNECT",
        visibility: "public",
        shareable: true
      })
    ).toBe(true);
  });
});

describe("P1-DATA XP event shape", () => {
  it("requires eventId + userId for idempotency", () => {
    const event: CanonicalXpEvent = {
      eventId: "evt-activity-abc",
      userId: "uid-1",
      eventType: "WORKOUT_COMPLETED",
      xpAwarded: 42,
      sourceType: "activity",
      sourceId: "abc-uuid",
      payload: {},
      processedAt: new Date(0).toISOString()
    };
    expect(event.eventId).toBeTruthy();
    expect(event.sourceType).toBe("activity");
    expect(event.sourceId).toBe("abc-uuid");
  });
});

describe("P1-DATA canonical activity id", () => {
  it("uses one id field for cross-platform reference", () => {
    const activity: CanonicalActivity = {
      id: "00000000-0000-4000-8000-000000000099",
      userId: "uid-1",
      provider: "HEALTH_CONNECT",
      externalId: "hc-1",
      sport: "RUN",
      startedAt: new Date(0).toISOString(),
      endedAt: new Date(3_600_000).toISOString(),
      distanceM: 5000,
      durationMs: 1_800_000,
      elevationGainM: 40,
      avgHeartRateBpm: 145,
      caloriesKcal: 420,
      visibility: "private",
      shareable: true,
      demoLabeled: false,
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString()
    };
    expect(activity.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
    expect(activity.distanceM).toBe(5000);
    expect(activity.durationMs).toBe(1_800_000);
  });
});

describe("P1-DATA identity keys", () => {
  it("does not invent a second application user id", () => {
    const uid = "firebase-sub-1";
    const keys: CanonicalIdentityKeys = {
      firebaseUid: uid,
      identityProfileId: uid,
      userId: uid,
      role: "athlete"
    };
    expect(keys.userId).toBe(keys.firebaseUid);
    expect(keys.identityProfileId).toBe(keys.firebaseUid);
  });
});
