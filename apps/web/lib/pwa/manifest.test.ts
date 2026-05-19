import { describe, it, expect } from "vitest";
import manifest from "@/app/manifest";

describe("web manifest", () => {
  const m = manifest();
  it("is standalone with Voltline theme colors", () => {
    expect(m.display).toBe("standalone");
    expect(m.theme_color).toBe("#07080A");
    expect(m.background_color).toBe("#07080A");
  });
  it("declares maskable icons", () => {
    expect(m.icons?.some((i) => i.purpose === "maskable")).toBe(true);
  });
  it("links the app start url", () => {
    expect(m.start_url).toBe("/dashboard");
  });
});
