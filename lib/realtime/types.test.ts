import { describe, it, expect } from "vitest";
import { isRealtimeMessage } from "./types";

describe("RealtimeMessage", () => {
  it("validates well-formed plan-update", () => {
    expect(
      isRealtimeMessage({
        kind: "plan-update",
        planId: "p1",
        athleteId: "a1",
        coachId: "c1",
        diff: "lighter-day",
        at: new Date().toISOString(),
        origin: "coach"
      })
    ).toBe(true);
  });
  it("rejects bad shape", () => {
    expect(isRealtimeMessage({ kind: "plan-update" })).toBe(false);
    expect(isRealtimeMessage({})).toBe(false);
  });
  it("rejects unknown kind", () => {
    expect(
      isRealtimeMessage({ kind: "unknown", at: new Date().toISOString() })
    ).toBe(false);
  });
  it("accepts minimal live-tick envelope (kind + at)", () => {
    expect(
      isRealtimeMessage({
        kind: "live-tick",
        at: "2026-05-17T12:00:00.000Z"
      })
    ).toBe(true);
  });
});
