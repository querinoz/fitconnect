import { describe, it, expect } from "vitest";
import { pwaInitOptions, isPWADisabled } from "@/lib/pwa/config.mjs";
import nextConfig from "@/next.config.mjs";

describe("next-pwa config", () => {
  it("disables the SW outside production", () => {
    const expected = process.env.NODE_ENV !== "production";
    expect(isPWADisabled()).toBe(expected);
    expect(pwaInitOptions.disable).toBe(expected);
  });

  it("targets public/ for SW output", () => {
    expect(pwaInitOptions.dest).toBe("public");
  });

  it("auto-registers the SW", () => {
    expect(pwaInitOptions.register).toBe(true);
  });

  it("preserves images.remotePatterns", () => {
    expect(nextConfig).toHaveProperty("images");
    expect(Array.isArray((nextConfig as any).images?.remotePatterns)).toBe(true);
    expect((nextConfig as any).images.remotePatterns.length).toBeGreaterThan(0);
  });
});
