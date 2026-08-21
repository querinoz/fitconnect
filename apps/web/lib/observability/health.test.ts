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
      NEXT_PUBLIC_DEMO_MODE: "false",
      NEXT_PUBLIC_SUPABASE_URL: undefined,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined
    } as NodeJS.ProcessEnv);
    expect(report.status).toBe("degraded");
    expect(report.dependencies.find((d) => d.name === "auth")?.status).toBe("degraded");
  });

  it("marks firebase degraded without web config", () => {
    const report = buildHealthReport({
      ...process.env,
      NEXT_PUBLIC_DEMO_MODE: "false",
      NEXT_PUBLIC_FIREBASE_API_KEY: undefined,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: undefined,
      NEXT_PUBLIC_FIREBASE_APP_ID: undefined
    } as NodeJS.ProcessEnv);
    expect(report.dependencies.find((d) => d.name === "firebase")?.status).toBe("degraded");
  });
});
