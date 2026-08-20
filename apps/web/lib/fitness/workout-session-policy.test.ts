import { describe, expect, it } from "vitest";
import {
  canSelectWorkoutSession,
  isShareableProvider
} from "./workout-session-policy";

describe("workout session RLS mirror", () => {
  const stravaPublic = {
    userId: "user-a",
    provider: "STRAVA",
    visibility: "public" as const
  };

  it("does not let user B read user A's STRAVA row even when visibility is public", () => {
    expect(isShareableProvider("STRAVA")).toBe(false);
    expect(canSelectWorkoutSession("user-b", stravaPublic)).toBe(false);
  });

  it("lets the owner read their own STRAVA row", () => {
    expect(canSelectWorkoutSession("user-a", stravaPublic)).toBe(true);
  });

  it("lets strangers read a public Health Connect session", () => {
    expect(
      canSelectWorkoutSession("user-b", {
        userId: "user-a",
        provider: "HEALTH_CONNECT",
        visibility: "public"
      })
    ).toBe(true);
  });
});
