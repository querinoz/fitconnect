import { describe, it, expect } from "vitest";
import { THEMES, DEFAULT_THEME, isThemeId } from "./themes";

describe("THEMES", () => {
  it("has the 5 locked presets", () => {
    expect(Object.keys(THEMES).sort()).toEqual(["aurora", "pulse", "solar", "tide", "voltline"]);
  });

  it("each theme defines volt token vars", () => {
    for (const t of Object.values(THEMES)) {
      expect(t.tokens["--volt-300"]).toBeDefined();
      expect(t.tokens["--volt-400"]).toBeDefined();
      expect(t.tokens["--volt-500"]).toBeDefined();
      expect(t.tokens["--volt-600"]).toBeDefined();
      expect(t.tokens["--volt-glow"]).toBeDefined();
    }
  });

  it("isThemeId guards", () => {
    expect(isThemeId("voltline")).toBe(true);
    expect(isThemeId("nope")).toBe(false);
  });

  it("defaults to voltline", () => {
    expect(DEFAULT_THEME).toBe("voltline");
  });
});
