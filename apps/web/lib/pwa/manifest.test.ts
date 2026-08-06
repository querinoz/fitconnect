import { describe, it, expect } from "vitest";
import manifest from "@/app/manifest";

describe("web manifest", () => {
  const m = manifest();
  it("is standalone with Elite OS theme colors", () => {
    expect(m.display).toBe("standalone");
    expect(m.theme_color).toBe("#C8FF00");
    expect(m.background_color).toBe("#070B14");
  });
  it("declares maskable icons", () => {
    expect(m.icons?.some((i) => i.purpose === "maskable")).toBe(true);
  });
  it("supports window controls overlay and shortcuts", () => {
    expect(m.display_override).toContain("window-controls-overlay");
    expect(m.shortcuts?.length).toBeGreaterThanOrEqual(3);
  });
  it("links the app start url", () => {
    expect(m.start_url).toBe("/dashboard");
  });
});
