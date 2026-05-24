import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveEffectiveReduced, parseStoredMotion } from "@fitconnect/design-tokens/src/motion-policy";
import { shouldReduceMotion } from "./should-reduce-motion";

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: matches && query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false
    }))
  );
}

describe("motion-policy", () => {
  it("should_follow_os_when_no_override", () => {
    expect(resolveEffectiveReduced(true, null)).toBe(true);
    expect(resolveEffectiveReduced(false, null)).toBe(false);
  });

  it("should_allow_user_override_to_win_over_os", () => {
    expect(resolveEffectiveReduced(true, "full")).toBe(false);
    expect(resolveEffectiveReduced(false, "reduced")).toBe(true);
  });
});

describe("shouldReduceMotion", () => {
  beforeEach(() => {
    document.documentElement.dataset.motion = "full";
    localStorage.clear();
    mockMatchMedia(false);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should_return_false_when_app_and_os_allow_full_motion", () => {
    expect(shouldReduceMotion()).toBe(false);
  });

  it("should_return_true_when_app_override_is_reduced", () => {
    localStorage.setItem("fitconnect:motion", "reduced");
    expect(shouldReduceMotion()).toBe(true);
  });

  it("should_return_false_when_app_override_is_full_even_if_os_reduced", () => {
    mockMatchMedia(true);
    localStorage.setItem("fitconnect:motion", "full");
    expect(shouldReduceMotion()).toBe(false);
  });

  it("should_return_true_when_os_reduced_and_no_override", () => {
    mockMatchMedia(true);
    expect(shouldReduceMotion()).toBe(true);
  });

  it("should_parse_stored_motion_values", () => {
    expect(parseStoredMotion("reduced")).toBe("reduced");
    expect(parseStoredMotion("full")).toBe("full");
    expect(parseStoredMotion(null)).toBe(null);
  });
});
