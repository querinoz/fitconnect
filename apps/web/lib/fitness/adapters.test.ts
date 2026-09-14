import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { listFitnessAdapters } from "./adapters";

describe("fitness adapter registry", () => {
  it("keeps Health Connect enabled and paid aggregators disabled", () => {
    const adapters = listFitnessAdapters();
    expect(adapters.find((a) => a.id === "HEALTH_CONNECT")?.constraints.enabled).toBe(true);
    expect(adapters.find((a) => a.id === "TERRA")?.constraints.enabled).toBe(false);
    expect(adapters.find((a) => a.id === "SPIKE")?.constraints.enabled).toBe(false);
    expect(adapters.find((a) => a.id === "ROOK")?.constraints.enabled).toBe(false);
    expect(adapters.find((a) => a.id === "STRAVA")?.constraints.shareable).toBe(false);
  });
});

describe("secret spots never public", () => {
  it("034 excludes is_secret rows from the public view", () => {
    const sql = readFileSync(
      path.resolve(__dirname, "../../../../supabase/migrations/034_secret_spots_never_public.sql"),
      "utf8"
    );
    expect(sql).toMatch(/is_secret IS NOT TRUE/);
    expect(sql).toMatch(/NULL::double precision AS exact_lat/);
  });
});
