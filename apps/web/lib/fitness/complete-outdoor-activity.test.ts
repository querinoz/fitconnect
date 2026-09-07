/**
 * P2-GPS outdoor completion contracts.
 */
import { describe, expect, it } from "vitest";
import {
  assertOutdoorCoords,
  assertOutdoorOwnership,
  assertOutdoorProvider
} from "@/lib/fitness/complete-outdoor-activity";

describe("P2-GPS outdoor contracts", () => {
  it("GPS-W-001 ownership", () => {
    expect(assertOutdoorOwnership("a", "a")).toBe(true);
    expect(assertOutdoorOwnership("a", "b")).toBe(false);
  });

  it("GPS-W-002 provider GPS only", () => {
    expect(assertOutdoorProvider("GPS")).toBe(true);
    expect(assertOutdoorProvider("STRAVA")).toBe(false);
    expect(assertOutdoorProvider("MANUAL")).toBe(false);
  });

  it("GPS-W-003 coords bounds", () => {
    expect(assertOutdoorCoords(38.72, -9.13)).toBe(true);
    expect(assertOutdoorCoords(91, 0)).toBe(false);
    expect(assertOutdoorCoords(0, 181)).toBe(false);
  });
});
