import { describe, it, expect, vi } from "vitest";
import { tap, success, warn } from "./haptics";

describe("haptics", () => {
  it("calls navigator.vibrate when available", () => {
    const v = vi.fn();
    Object.defineProperty(navigator, "vibrate", { value: v, configurable: true });
    tap();
    success();
    warn();
    expect(v).toHaveBeenCalledTimes(3);
  });
  it("does nothing if vibrate is missing", () => {
    Object.defineProperty(navigator, "vibrate", {
      value: undefined,
      configurable: true
    });
    expect(() => tap()).not.toThrow();
  });
});
