import { describe, expect, it } from "vitest";
import { orchestrateZenith } from "@fitconnect/ai";

describe("zenith orchestrator", () => {
  it("marks metrics MISSING when telemetry is absent", () => {
    const result = orchestrateZenith({ athleteId: "a1" });
    expect(result.metrics.hrvMs.provenance).toBe("MISSING");
    expect(result.metrics.hrvMs.value).toBeNull();
    expect(result.llmRoute).toBe("fallback");
  });

  it("blocks injury specialist from diagnosing", () => {
    const result = orchestrateZenith({
      athleteId: "a1",
      userText: "I have knee pain, diagnose me",
      hrvMs: 60,
      sleepHours: 7.5
    });
    expect(result.specialist).toBe("injury_safety");
    expect(result.safety.blocked).toBe(true);
    expect(result.explanation).toMatch(/not diagnose/i);
  });

  it("requires approval for training plan actions", () => {
    const result = orchestrateZenith({
      athleteId: "a1",
      specialist: "training",
      hrvMs: 70,
      sleepHours: 8
    });
    expect(result.actions[0]?.requiresApproval).toBe(true);
  });
});
