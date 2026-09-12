import { afterEach, describe, expect, it, vi } from "vitest";
import { authBackend } from "./auth-backend";

describe("authBackend", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns demo when NEXT_PUBLIC_DEMO_MODE is true", () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    expect(authBackend()).toBe("demo");
  });

  it("returns unconfigured when demo is off and Firebase env is incomplete", () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_API_KEY", "");
    expect(authBackend()).toBe("unconfigured");
  });
});
