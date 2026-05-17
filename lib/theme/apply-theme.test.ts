import { describe, it, expect, beforeEach } from "vitest";
import { applyTheme } from "./apply-theme";
import { THEMES } from "./themes";

describe("applyTheme", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("style");
    document.documentElement.removeAttribute("data-theme");
  });

  it("writes the theme tokens to documentElement", () => {
    applyTheme("pulse");
    expect(document.documentElement.style.getPropertyValue("--volt-500")).toBe(
      THEMES.pulse.tokens["--volt-500"]
    );
    expect(document.documentElement.dataset.theme).toBe("pulse");
  });

  it("ignores invalid theme ids", () => {
    applyTheme("voltline");
    // @ts-expect-error intentional bad id for runtime guard
    applyTheme("nope");
    expect(document.documentElement.dataset.theme).toBe("voltline");
  });
});
