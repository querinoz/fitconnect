import { describe, expect, it } from "vitest";
import { TRAINERS } from "@/lib/data";
import { matchCoaches } from "@/lib/quiz-match";

describe("matchCoaches", () => {
  it("returns three coaches ranked by compatibility", () => {
    const matches = matchCoaches(TRAINERS, {
      sport: "Yoga",
      goal: "health",
      experience: "intermediate",
      schedule: "2",
      modality: "online"
    });
    expect(matches).toHaveLength(3);
    expect(matches[0]!.compatibility).toBeGreaterThanOrEqual(matches[1]!.compatibility);
    expect(matches[0]!.trainer.sports).toContain("Yoga");
  });
});
