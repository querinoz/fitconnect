import { describe, expect, it } from "vitest";
import { emptyAdminFunnel, emptyAdminKpis, getAdminFunnel, getAdminKpis } from "./kpis";

describe("admin kpis", () => {
  it("does not invent marketplace metrics", () => {
    const kpis = getAdminKpis();
    expect(kpis.paidAthletes).toBe(0);
    expect(kpis.mrrEur).toBe(0);
    expect(kpis.source).toBe("unavailable");
    expect(emptyAdminKpis().verifiedCoaches).toBe(0);
  });

  it("returns funnel steps in order with empty counts", () => {
    const funnel = getAdminFunnel();
    expect(funnel[0]?.label).toBe("Signup");
    expect(funnel.every((s) => s.count === 0)).toBe(true);
    expect(emptyAdminFunnel()).toHaveLength(4);
  });
});
