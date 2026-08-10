import { describe, expect, it } from "vitest";
import {
  isDemoModeEnv,
  isSupabaseConfiguredEnv,
  shouldEnforceSupabaseAuth,
  hasValidDemoSessionCookie
} from "./middleware-auth";

describe("middleware auth policy", () => {
  it("treats unset DEMO_MODE as demo off (fail-closed)", () => {
    expect(isDemoModeEnv(undefined)).toBe(false);
  });

  it("enables demo only when explicitly true", () => {
    expect(isDemoModeEnv("true")).toBe(true);
    expect(isDemoModeEnv("false")).toBe(false);
  });

  it("allows demo mode through without Supabase enforcement", () => {
    expect(
      shouldEnforceSupabaseAuth({ demoMode: true, supabaseConfigured: true })
    ).toBe(false);
    expect(
      shouldEnforceSupabaseAuth({ demoMode: true, supabaseConfigured: false })
    ).toBe(false);
  });

  it("enforces Supabase only when demo is off and Supabase is configured", () => {
    expect(
      shouldEnforceSupabaseAuth({ demoMode: false, supabaseConfigured: true })
    ).toBe(true);
    expect(
      shouldEnforceSupabaseAuth({ demoMode: false, supabaseConfigured: false })
    ).toBe(false);
  });

  it("detects Supabase env configuration", () => {
    expect(isSupabaseConfiguredEnv("https://x.supabase.co", "anon-key")).toBe(true);
    expect(isSupabaseConfiguredEnv(undefined, "anon-key")).toBe(false);
  });

  it("accepts valid demo session cookies", () => {
    expect(
      hasValidDemoSessionCookie("athlete", (id) => id === "athlete")
    ).toBe(true);
    expect(hasValidDemoSessionCookie("%invalid", () => false)).toBe(false);
  });
});
