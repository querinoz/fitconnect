import { describe, expect, it } from "vitest";
import { mapAuthErrorMessage, resolveAuthPhase, toCanonicalAuthState } from "./auth-phase";
import { resolveProtectedRouteGate } from "./middleware-auth";

describe("auth phase machine", () => {
  it("cold start is INITIALIZING until hydrated", () => {
    expect(resolveAuthPhase({ hydrated: false, hasUser: false })).toBe("INITIALIZING");
    expect(resolveAuthPhase({ hydrated: false, hasUser: true })).toBe("INITIALIZING");
  });

  it("hydrated without user is UNAUTHENTICATED", () => {
    expect(resolveAuthPhase({ hydrated: true, hasUser: false })).toBe("UNAUTHENTICATED");
  });

  it("hydrated with user is AUTHENTICATED", () => {
    expect(resolveAuthPhase({ hydrated: true, hasUser: true })).toBe("AUTHENTICATED");
  });

  it("refresh and error override", () => {
    expect(resolveAuthPhase({ hydrated: true, hasUser: true, refreshing: true })).toBe(
      "REFRESHING"
    );
    expect(resolveAuthPhase({ hydrated: true, hasUser: true, error: true })).toBe("ERROR");
    expect(resolveAuthPhase({ hydrated: true, hasUser: false, authUnavailable: true })).toBe(
      "AUTH_UNAVAILABLE"
    );
    expect(resolveAuthPhase({ hydrated: true, hasUser: true, logoutPending: true })).toBe(
      "LOGOUT_PENDING"
    );
    expect(resolveAuthPhase({ hydrated: true, hasUser: false, authenticating: true })).toBe(
      "AUTHENTICATING"
    );
  });
});

describe("canonical auth state mapping", () => {
  it("maps compact web phases onto the cross-surface machine", () => {
    expect(toCanonicalAuthState("UNAUTHENTICATED")).toBe("SIGNED_OUT");
    expect(toCanonicalAuthState("AUTHENTICATED")).toBe("AUTHENTICATED");
    expect(toCanonicalAuthState("AUTHENTICATED", { ready: true })).toBe("READY");
    expect(toCanonicalAuthState("AUTHENTICATED", { bootstrapping: true })).toBe("BOOTSTRAPPING");
    expect(toCanonicalAuthState("REFRESHING")).toBe("TOKEN_REFRESH");
    expect(toCanonicalAuthState("ERROR")).toBe("AUTH_ERROR");
    expect(toCanonicalAuthState("AUTH_UNAVAILABLE")).toBe("AUTH_UNAVAILABLE");
    expect(toCanonicalAuthState("LOGOUT_PENDING")).toBe("LOGOUT_PENDING");
  });
});

describe("auth error messages", () => {
  it("never exposes JWT/stack internals", () => {
    expect(mapAuthErrorMessage("invalid_credentials")).not.toMatch(/jwt|stack|token/i);
    expect(mapAuthErrorMessage("auth_not_configured")).toContain("unavailable");
  });
});

describe("protected route fail-closed", () => {
  it("opens only in explicit demo", () => {
    expect(resolveProtectedRouteGate({ demoMode: true, firebaseConfigured: false })).toBe(
      "open"
    );
  });

  it("denies when demo off and Firebase missing", () => {
    expect(resolveProtectedRouteGate({ demoMode: false, firebaseConfigured: false })).toBe(
      "auth_unavailable"
    );
  });

  it("requires Firebase cookie when configured", () => {
    expect(resolveProtectedRouteGate({ demoMode: false, firebaseConfigured: true })).toBe(
      "require_firebase"
    );
  });
});
