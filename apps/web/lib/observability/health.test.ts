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
});
