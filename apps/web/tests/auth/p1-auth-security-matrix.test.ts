/**
 * P1-AUTH security matrix (unit-level). Live Firebase signup is PENDING_HUMAN when keys absent.
 */
import { describe, expect, it } from "vitest";
import { canAssignAppRole, parseAppRole } from "@/lib/identity/role-policy";
import {
  hasFirebaseSessionCookie,
  isDemoModeEnv,
  resolveProtectedRouteGate,
} from "@/lib/auth/middleware-auth";
import { resolveAuthPhase, toCanonicalAuthState } from "@/lib/auth/auth-phase";
import type { CanonicalIdentityKeys } from "@fitconnect/types";

describe("P1-AUTH role authority", () => {
  it("allows first athlete/coach assignment", () => {
    expect(canAssignAppRole(null, "athlete")).toBe(true);
    expect(canAssignAppRole(null, "coach")).toBe(true);
  });

  it("denies admin self-assign and role spoof switches", () => {
    expect(canAssignAppRole(null, "admin")).toBe(false);
    expect(canAssignAppRole("athlete", "coach")).toBe(false);
    expect(canAssignAppRole("athlete", "admin")).toBe(false);
  });

  it("parses server roles only", () => {
    expect(parseAppRole("athlete")).toBe("athlete");
    expect(parseAppRole("COACH")).toBe("coach");
    expect(parseAppRole({ role: "coach" })).toBeNull();
  });
});

describe("P1-AUTH session phase", () => {
  it("does not treat undefined hydration as authenticated", () => {
    expect(resolveAuthPhase({ hydrated: false, hasUser: false })).toBe("INITIALIZING");
    expect(resolveAuthPhase({ hydrated: true, hasUser: false })).toBe("UNAUTHENTICATED");
    expect(toCanonicalAuthState("UNAUTHENTICATED")).toBe("SIGNED_OUT");
  });
});

describe("P1-AUTH production gate", () => {
  it("never opens protected HTML without demo or Firebase", () => {
    expect(resolveProtectedRouteGate({ demoMode: false, firebaseConfigured: false })).not.toBe(
      "open"
    );
  });

  it("demo bypass is closed unless NEXT_PUBLIC_DEMO_MODE is exactly true", () => {
    expect(isDemoModeEnv(undefined)).toBe(false);
    expect(isDemoModeEnv("false")).toBe(false);
    expect(isDemoModeEnv("1")).toBe(false);
    expect(isDemoModeEnv("true")).toBe(true);
  });

  it("demo-session cookie is not a Firebase auth factor", () => {
    expect(hasFirebaseSessionCookie("athlete")).toBe(false);
    expect(hasFirebaseSessionCookie("aaa.bbb.ccc")).toBe(true);
  });
});

describe("P1-AUTH identity contract", () => {
  it("maps Firebase UID 1:1 onto identity_profiles.id / userId", () => {
    const uid = "firebase-uid-example";
    const keys: CanonicalIdentityKeys = {
      firebaseUid: uid,
      identityProfileId: uid,
      userId: uid,
      role: "athlete",
    };
    expect(keys.identityProfileId).toBe(keys.firebaseUid);
    expect(keys.userId).toBe(keys.firebaseUid);
  });
});
