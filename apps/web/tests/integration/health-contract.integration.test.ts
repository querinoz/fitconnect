import { describe, expect, it } from "vitest";
import { buildHealthReport, type HealthReport } from "@/lib/observability/health";
import { buildDemoEnv, buildProductionEnv } from "../fixtures/domain";

function assertHealthContract(report: HealthReport) {
  expect(report.status).toMatch(/^(ok|degraded)$/);
  expect(report.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  expect(typeof report.version).toBe("string");
  expect(Array.isArray(report.dependencies)).toBe(true);
  expect(report.dependencies.length).toBeGreaterThanOrEqual(5);

  for (const dep of report.dependencies) {
    expect(dep.name).toBeTruthy();
    expect(dep.status).toMatch(/^(ok|degraded|down)$/);
  }

  const names = report.dependencies.map((d) => d.name);
  expect(names).toContain("auth");
  expect(names).toContain("database");
  expect(names).toContain("realtime");
}

describe("health API contract", () => {
  it("should_return_ok_status_in_demo_mode_with_all_core_dependencies", () => {
    const report = buildHealthReport(buildDemoEnv());
    assertHealthContract(report);
    expect(report.status).toBe("ok");
    expect(report.dependencies.find((d) => d.name === "auth")?.detail).toContain("demo");
  });

  it("should_return_degraded_when_production_env_missing_supabase", () => {
    const report = buildHealthReport(
      buildProductionEnv({
        NEXT_PUBLIC_SUPABASE_URL: undefined,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
        NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyTest",
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "fitconnect.firebaseapp.com",
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "fitconnect",
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "fitconnect.appspot.com",
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123",
        NEXT_PUBLIC_FIREBASE_APP_ID: "1:123:web:abc"
      })
    );
    assertHealthContract(report);
    expect(report.status).toBe("degraded");
    expect(report.dependencies.find((d) => d.name === "auth")?.status).toBe("ok");
    expect(report.dependencies.find((d) => d.name === "supabase_data")?.status).toBe("degraded");
  });

  it("should_flag_placeholder_env_values_as_not_configured", () => {
    const report = buildHealthReport(
      buildDemoEnv({
        DATABASE_URL: "PASTE_YOUR_DATABASE_URL"
      })
    );
    expect(report.dependencies.find((d) => d.name === "database")?.status).toBe("degraded");
  });
});
