import { describe, expect, it } from "vitest";
import { hasFirebaseSessionCookie, shouldEnforceFirebaseAuth } from "./middleware-auth";

describe("firebase middleware cookie", () => {
  it("accepts JWT-shaped cookies only", () => {
    expect(hasFirebaseSessionCookie("a.b.c")).toBe(true);
    expect(hasFirebaseSessionCookie("nope")).toBe(false);
    expect(hasFirebaseSessionCookie(undefined)).toBe(false);
  });

  it("does not enforce Firebase when demo is on", () => {
    expect(shouldEnforceFirebaseAuth({ demoMode: true, firebaseConfigured: true })).toBe(false);
  });
});
