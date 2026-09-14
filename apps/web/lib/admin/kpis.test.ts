import { afterEach, describe, expect, it, vi } from "vitest";
import { emptyAdminFunnel, emptyAdminKpis, getAdminFunnel, getAdminKpis, loadAdminAthletes } from "./kpis";

vi.mock("next/server", () => ({
  connection: async () => undefined
}));

describe("admin kpis", () => {
  const prevDb = process.env.DATABASE_URL;
  const prevAllow = process.env.FITCONNECT_ALLOW_DOCKER_DB;

  afterEach(() => {
    if (prevDb === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = prevDb;
    if (prevAllow === undefined) delete process.env.FITCONNECT_ALLOW_DOCKER_DB;
    else process.env.FITCONNECT_ALLOW_DOCKER_DB = prevAllow;
  });

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

  it("does not open Postgres when DATABASE_URL hostname is docker-only `base`", async () => {
    process.env.DATABASE_URL = "postgres://user:pass@base:5432/postgres";
    await expect(loadAdminAthletes()).resolves.toEqual([]);
  });
});
