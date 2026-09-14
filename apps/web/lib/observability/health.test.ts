import { describe, expect, it } from "vitest";
import { buildHealthReport } from "./health";

describe("buildHealthReport", () => {
  it("returns ok in demo mode", () => {
    const report = buildHealthReport({
      ...process.env,
      NEXT_PUBLIC_DEMO_MODE: "true",
      NEXT_PUBLIC_FIREBASE_API_KEY: undefined,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: undefined,
      NEXT_PUBLIC_FIREBASE_APP_ID: undefined
    } as NodeJS.ProcessEnv);
    expect(report.status).toBe("ok");
    expect(report.dependencies.find((d) => d.name === "auth")?.status).toBe("ok");
  });

  it("marks auth down without Firebase when demo is off", () => {
    const report = buildHealthReport({
      ...process.env,
      NEXT_PUBLIC_DEMO_MODE: "false",
      NEXT_PUBLIC_FIREBASE_API_KEY: undefined,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: undefined,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: undefined,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: undefined,
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: undefined,
      NEXT_PUBLIC_FIREBASE_APP_ID: undefined,
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon"
    } as NodeJS.ProcessEnv);
    expect(report.status).toBe("degraded");
    expect(report.dependencies.find((d) => d.name === "auth")?.status).toBe("down");
    expect(report.dependencies.find((d) => d.name === "auth")?.detail).toMatch(/AUTH_UNAVAILABLE/);
  });

  it("marks firebase ok when web config complete", () => {
    const report = buildHealthReport({
      ...process.env,
      NEXT_PUBLIC_DEMO_MODE: "false",
      NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyTest",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "fitconnect.firebaseapp.com",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "fitconnect",
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "fitconnect.appspot.com",
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123",
      NEXT_PUBLIC_FIREBASE_APP_ID: "1:123:web:abc"
    } as NodeJS.ProcessEnv);
    expect(report.dependencies.find((d) => d.name === "firebase")?.status).toBe("ok");
    expect(report.dependencies.find((d) => d.name === "auth")?.status).toBe("ok");
  });

  it("uses in-memory rate limit when Upstash is unset", () => {
    const report = buildHealthReport({
      ...process.env,
      NEXT_PUBLIC_DEMO_MODE: "false",
      UPSTASH_REDIS_REST_URL: undefined,
      UPSTASH_REDIS_REST_TOKEN: undefined
    } as NodeJS.ProcessEnv);
    expect(report.dependencies.find((d) => d.name === "redis")?.detail).toMatch(/in-memory/);
  });

  it("marks first-party analytics ok when DATABASE_URL is set", () => {
    const report = buildHealthReport({
      ...process.env,
      NEXT_PUBLIC_DEMO_MODE: "false",
      NEXT_PUBLIC_POSTHOG_KEY: undefined,
      NEXT_PUBLIC_SENTRY_DSN: undefined,
      DATABASE_URL: "postgres://example/db"
    } as NodeJS.ProcessEnv);
    expect(report.dependencies.find((d) => d.name === "analytics")?.status).toBe("ok");
    expect(report.dependencies.find((d) => d.name === "analytics")?.detail).toMatch(/first-party/);
  });

  it("does not treat docker hostname base as a live postgres", () => {
    const report = buildHealthReport({
      ...process.env,
      NEXT_PUBLIC_DEMO_MODE: "false",
      DATABASE_URL: "postgres://user:pass@base:5432/postgres"
    } as NodeJS.ProcessEnv);
    expect(report.dependencies.find((d) => d.name === "database")?.status).toBe("degraded");
    expect(report.dependencies.find((d) => d.name === "database")?.detail).toMatch(/docker-only/);
  });

  it("does not claim live or demo checkout when Stripe is unset", () => {
    const report = buildHealthReport({
      ...process.env,
      NEXT_PUBLIC_DEMO_MODE: "false",
      STRIPE_SECRET_KEY: undefined
    } as NodeJS.ProcessEnv);
    expect(report.dependencies.find((d) => d.name === "stripe")?.detail).toBe("not configured");
  });

  it("labels sk_test keys as test mode, not live checkout", () => {
    const report = buildHealthReport({
      ...process.env,
      NEXT_PUBLIC_DEMO_MODE: "false",
      STRIPE_SECRET_KEY: "sk_test_fixture"
    } as NodeJS.ProcessEnv);
    expect(report.dependencies.find((d) => d.name === "stripe")?.detail).toBe("stripe test mode");
  });
});
