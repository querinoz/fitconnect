import { describe, expect, it } from "vitest";
import { getShellNavItems } from "./nav-config";
import { en } from "@/lib/i18n/locales/en";

describe("athlete shell IA", () => {
  it("has four destinations and no train tab", () => {
    const items = getShellNavItems("athlete", en.mobileApp.nav);
    expect(items.map((item) => item.href)).toEqual([
      "/feed",
      "/achievements",
      "/dashboard",
      "/profile"
    ]);
    expect(items.map((item) => item.label)).toEqual([
      "Feed",
      "Ascend",
      "Dashboard",
      "Profile"
    ]);
    expect(items.some((item) => item.href === "/sessions")).toBe(false);
    expect(items.some((item) => item.href === "/train")).toBe(false);
    expect(items.length).toBe(4);
  });
});
