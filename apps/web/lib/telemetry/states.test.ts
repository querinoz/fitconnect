import { describe, expect, it } from "vitest";
import { datumFromScore, surfaceLabel } from "./states";

describe("telemetry honesty states", () => {
  it("never invents a score from null", () => {
    const d = datumFromScore("Readiness", null, { source: "insufficient_data" });
    expect(d.state).toBe("missing");
    expect(d.value).toBeNull();
  });

  it("maps not_connected honestly", () => {
    const d = datumFromScore("HRV", null, { source: "not_connected" });
    expect(d.state).toBe("not_connected");
    expect(d.value).toBeNull();
  });

  it("passes through finite scores", () => {
    const d = datumFromScore("Readiness", 81.4, { source: "profile" });
    expect(d).toMatchObject({ state: "ready", value: 81, source: "profile" });
  });

  it("labels surfaces", () => {
    expect(surfaceLabel("not_connected")).toBe("Not connected");
  });
});
