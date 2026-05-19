import { describe, expect, it } from "vitest";
import { getAdminKpis, getAdminFunnel } from "./kpis";

describe("admin kpis", () => {
  it("returns stable demo metrics", () => {
    const kpis = getAdminKpis();
    expect(kpis.paidAthletes).toBeGreaterThan(0);
    expect(kpis.mrrEur).toBeGreaterThan(0);
  });

  it("returns funnel steps in order", () => {
    const funnel = getAdminFunnel();
    expect(funnel[0]?.label).toBe("Signup");
    expect(funnel.at(-1)?.rate).toBeLessThan(funnel[0]?.rate ?? 1);
  });
});
