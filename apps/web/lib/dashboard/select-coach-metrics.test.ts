import { describe, expect, it } from "vitest";
import { initialDashboardState } from "./seed";
import { selectCoachMetrics } from "../dashboard-store";

describe("selectCoachMetrics", () => {
  it("does not leak seed payouts to an unknown coach", () => {
    const metrics = selectCoachMetrics(initialDashboardState, "firebase-coach");
    expect(metrics.revenueMtd).toBe("—");
    expect(metrics.activeAthletes).toBe(0);
    expect(metrics.sessionsWeek).toBe(0);
  });
});
