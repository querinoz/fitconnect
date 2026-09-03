import { describe, expect, it } from "vitest";
import { buildAuthConfigDiagnostic } from "./auth-config-status";
import path from "node:path";

describe("auth config diagnostic (no secrets)", () => {
  it("reports Firebase missing and demo disabled without inventing ready", () => {
    const report = buildAuthConfigDiagnostic({
      env: {
        NEXT_PUBLIC_DEMO_MODE: "false"
      } as unknown as NodeJS.ProcessEnv,
      googleServicesPath: path.join("definitely", "missing", "google-services.json")
    });
    expect(report.AUTH_PROVIDER).toBe("FIREBASE");
    expect(report.DEMO_MODE).toBe("DISABLED");
    expect(report.FIREBASE_WEB_CONFIG).toBe("MISSING");
    expect(report.ANDROID_GOOGLE_SERVICES).toBe("MISSING");
    expect(report.PRODUCTION_AUTH_READY).toBe(false);
    expect(JSON.stringify(report)).not.toMatch(/AIza|BEGIN PRIVATE|service_role/i);
  });

  it("marks web config present only when complete public Firebase set exists", () => {
    const report = buildAuthConfigDiagnostic({
      env: {
        NEXT_PUBLIC_DEMO_MODE: "false",
        NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyTest",
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "x.firebaseapp.com",
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "x",
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "x.appspot.com",
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "1",
        NEXT_PUBLIC_FIREBASE_APP_ID: "1:1:web:abc"
      } as unknown as NodeJS.ProcessEnv,
      googleServicesPath: path.join("definitely", "missing", "google-services.json")
    });
    expect(report.FIREBASE_WEB_CONFIG).toBe("PRESENT");
    expect(report.PRODUCTION_AUTH_READY).toBe(false);
    expect(report.ANDROID_GOOGLE_SERVICES).toBe("MISSING");
  });
});
