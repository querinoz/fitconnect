import { describe, expect, it } from "vitest";
import { canAccessStravaOwnedRecord } from "./workout-session-policy";

describe("Strava owned-record authorization", () => {
  it("allows the owner and denies everyone else", () => {
    expect(canAccessStravaOwnedRecord({ actorId: "user-a", ownerId: "user-a" })).toBe(true);
    expect(canAccessStravaOwnedRecord({ actorId: "user-b", ownerId: "user-a" })).toBe(false);
    expect(canAccessStravaOwnedRecord({ actorId: "coach-b", ownerId: "user-a" })).toBe(false);
    expect(canAccessStravaOwnedRecord({ actorId: "user-a", ownerId: "user-a" })).toBe(true);
    expect(canAccessStravaOwnedRecord({ actorId: "", ownerId: "user-a" })).toBe(false);
  });
});
