import { describe, expect, it } from "vitest";
import {
  assertGuidedOwnership,
  assertGuidedProvider,
  GUIDED_ACTIVITY_PROVIDER
} from "./complete-guided-workout";

describe("complete-guided-workout", () => {
  it("rejects cross-user completion", () => {
    expect(assertGuidedOwnership("uid-a", "uid-b")).toBe(false);
    expect(assertGuidedOwnership("uid-a", "uid-a")).toBe(true);
  });

  it("rejects Strava provider for guided write", () => {
    expect(assertGuidedProvider("STRAVA")).toBe(false);
    expect(assertGuidedProvider(GUIDED_ACTIVITY_PROVIDER)).toBe(true);
  });
});
