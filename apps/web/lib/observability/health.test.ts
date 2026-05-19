import { describe, expect, it } from "vitest";
import { buildHealthReport } from "./health";

describe("buildHealthReport", () => {
  it("returns ok in demo mode", () => {
    const report = buildHealthReport({
      ...process.env,
      NEXT_PUBLIC_DEMO_MODE: "true"
    });
    expect(report.status).toBe("ok");
    expect(report.dependencies.length).toBeGreaterThan(0);
  });

  it("marks auth degraded without supabase or demo", () => {
    const report = buildHealthReport({
      ...process.env,
      NEXT_PUBLIC_DEMO_MODE: "false"
    });
    expect(report.status).toBe("degraded");
  });
});
