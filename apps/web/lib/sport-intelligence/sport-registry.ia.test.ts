import { describe, expect, it } from "vitest";
import {
  gpsSupported,
  listSportGroups,
  SPORT_GROUPS
} from "@/lib/sport-intelligence/sport-registry";

describe("sport registry IA groups", () => {
  it("exposes non-empty FitConnect groups", () => {
    const groups = listSportGroups();
    expect(groups.length).toBeGreaterThan(3);
    expect(groups.some((g) => g.id === "ENDURANCE")).toBe(true);
    expect(groups.some((g) => g.id === "STRENGTH")).toBe(true);
  });

  it("gpsSupported is capability-aware", () => {
    expect(gpsSupported("RUNNING")).toBe(true);
    expect(gpsSupported("STRENGTH")).toBe(false);
  });

  it("group sports resolve in registry", () => {
    for (const sportId of SPORT_GROUPS.ENDURANCE.sportIds) {
      expect(typeof sportId).toBe("string");
    }
  });
});
