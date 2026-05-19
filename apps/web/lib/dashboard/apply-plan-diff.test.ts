import { describe, it, expect, beforeEach } from "vitest";
import { useDashboardStore } from "@/lib/dashboard-store";

describe("applyPlanDiff", () => {
  beforeEach(() => {
    useDashboardStore.getState().resetDemo();
  });

  it("lighter-day reduces today's intensity tag", () => {
    const planId = useDashboardStore.getState().plans[0].id;
    useDashboardStore.getState().applyPlanDiff(planId, "lighter-day");
    const plan = useDashboardStore.getState().plans.find((p) => p.id === planId)!;
    const today = plan.blocks[0];
    expect(today.intensity.toLowerCase()).toMatch(/light|easy|recovery/);
  });

  it("swap-z2 retitles today to Z2", () => {
    const planId = useDashboardStore.getState().plans[0].id;
    useDashboardStore.getState().applyPlanDiff(planId, "swap-z2");
    const plan = useDashboardStore.getState().plans.find((p) => p.id === planId)!;
    expect(plan.blocks[0].title.toLowerCase()).toContain("z2");
  });
});
