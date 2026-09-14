import { describe, expect, it, vi } from "vitest";
import { resolveDashboardAthleteId, resolveDashboardCoachId } from "./resolve-scope";

describe("dashboard athlete scope", () => {
  it("never falls back to the demo athlete outside LOCAL_DEMO", () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");
    expect(resolveDashboardAthleteId({ id: "firebase-uid" })).toBe("firebase-uid");
    expect(resolveDashboardAthleteId(null)).toBe("");
    vi.unstubAllEnvs();
  });

  it("uses the demo athlete when LOCAL_DEMO is on and no user is linked", () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    expect(resolveDashboardAthleteId(null)).toBe("a-ines");
    vi.unstubAllEnvs();
  });
});

describe("dashboard coach scope", () => {
  it("never falls back to seed coach Tomás outside LOCAL_DEMO", () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");
    expect(resolveDashboardCoachId({ id: "firebase-uid" })).toBe("firebase-uid");
    expect(resolveDashboardCoachId(null)).toBe("");
    vi.unstubAllEnvs();
  });

  it("uses a demo coach id when LOCAL_DEMO is on and no user is linked", () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    expect(resolveDashboardCoachId(null)).toBe("t-001");
    vi.unstubAllEnvs();
  });
});
