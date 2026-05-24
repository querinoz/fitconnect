import { describe, it, expect } from "vitest";
import { aiMatchScore } from "./ai-match-score";

describe("aiMatchScore", () => {
  it("returns stable scores between 72 and 95", () => {
    expect(aiMatchScore("t-001")).toBe(aiMatchScore("t-001"));
    expect(aiMatchScore("t-001")).toBeGreaterThanOrEqual(72);
    expect(aiMatchScore("t-001")).toBeLessThanOrEqual(95);
  });

  it("varies across trainer ids", () => {
    const a = aiMatchScore("t-001");
    const b = aiMatchScore("t-002");
    expect(a).not.toBe(b);
  });
});
