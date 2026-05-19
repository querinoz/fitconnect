import { describe, expect, it } from "vitest";
import { clamp, formatPrice, initials, pluralize } from "./index";

describe("@fitconnect/utils", () => {
  it("formats EUR prices", () => {
    expect(formatPrice(12)).toMatch(/12/);
  });

  it("builds initials", () => {
    expect(initials("Inês M.")).toBe("IM");
  });

  it("pluralizes counts", () => {
    expect(pluralize(1, "session")).toBe("1 session");
    expect(pluralize(3, "session")).toBe("3 sessions");
  });

  it("clamps values", () => {
    expect(clamp(150, 0, 100)).toBe(100);
    expect(clamp(-5, 0, 100)).toBe(0);
  });
});
