/**
 * P2CORE-001…004 — coach remote source + guided completion ownership (unit).
 */
import { describe, expect, it } from "vitest";
import {
  assertGuidedOwnership,
  assertGuidedProvider
} from "@/lib/fitness/complete-guided-workout";
import { listCoachRoster, listCoachSessions } from "@/lib/db/repository";

describe("P2-CORE web contracts", () => {
  it("P2CORE-001 guided ownership rejects foreign userId", () => {
    expect(assertGuidedOwnership("user-a", "user-a")).toBe(true);
    expect(assertGuidedOwnership("user-a", "user-b")).toBe(false);
  });

  it("P2CORE-002 guided provider rejects STRAVA", () => {
    expect(assertGuidedProvider("MANUAL")).toBe(true);
    expect(assertGuidedProvider("STRAVA")).toBe(false);
  });

  it("P2CORE-003 coach roster returns labeled source", async () => {
    const result = await listCoachRoster("t-002");
    expect(["seed", "empty", "postgres"]).toContain(result.source);
    expect(Array.isArray(result.roster)).toBe(true);
  });

  it("P2CORE-004 coach sessions return labeled source + valid status", async () => {
    const result = await listCoachSessions("t-002");
    expect(["seed", "empty", "postgres"]).toContain(result.source);
    for (const s of result.sessions) {
      expect(["scheduled", "live", "completed"]).toContain(s.status);
    }
  });

  it("P2CORE-005 coach programs return labeled source", async () => {
    const { listCoachPrograms } = await import("@/lib/db/repository");
    const result = await listCoachPrograms("t-002");
    expect(["seed", "empty", "postgres"]).toContain(result.source);
    expect(Array.isArray(result.programs)).toBe(true);
  });

  it("P2CORE-006 coach bookings return labeled source", async () => {
    const { listCoachBookings } = await import("@/lib/db/repository");
    const result = await listCoachBookings("t-002");
    expect(["seed", "empty", "postgres"]).toContain(result.source);
    expect(Array.isArray(result.bookings)).toBe(true);
  });
});
