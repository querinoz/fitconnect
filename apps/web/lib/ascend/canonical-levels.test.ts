import { describe, expect, it } from "vitest";
import { CANONICAL_BANDS, resolveCanonicalLevel } from "./canonical-levels";

describe("canonical-levels", () => {
  it("matches Android LevelTable band thresholds", () => {
    expect(CANONICAL_BANDS).toHaveLength(15);
    expect(CANONICAL_BANDS[0]?.xpRequired).toBe(0);
    expect(CANONICAL_BANDS[14]?.xpRequired).toBe(25_000);
  });

  it("resolves level 1 at 0 xp and level 2 at 200 xp", () => {
    expect(resolveCanonicalLevel(0).level).toBe(1);
    expect(resolveCanonicalLevel(199).level).toBe(1);
    expect(resolveCanonicalLevel(200).level).toBe(2);
  });

  it("computes progress into current band", () => {
    const at700 = resolveCanonicalLevel(700);
    expect(at700.level).toBe(3);
    expect(at700.xpIntoLevel).toBe(200);
    expect(at700.progressPercent).toBe(50);
  });

  it("caps at legacy rank for max xp", () => {
    const max = resolveCanonicalLevel(99_999);
    expect(max.level).toBe(15);
    expect(max.progressPercent).toBe(100);
    expect(max.xpToNext).toBe(0);
  });
});
