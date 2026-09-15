import { describe, expect, it } from "vitest";
import { xpForProgressionEvent } from "./xp";

describe("progression XP", () => {
  it("starts awards from duration, not a seeded 120", () => {
    expect(
      xpForProgressionEvent({
        type: "WORKOUT_COMPLETED",
        payload: { durationMs: 30 * 60_000 }
      })
    ).toBe(60);
  });

  it("does not invent XP from empty payloads beyond the 15 floor", () => {
    expect(xpForProgressionEvent({ type: "WORKOUT_COMPLETED" })).toBe(15);
  });
});
