import { describe, expect, it } from "vitest";
import { isAbsoluteHttpUrl, isConvexConfigured, readConvexUrl } from "./client";

describe("convex public URL", () => {
  it("rejects missing, blank, and non-http values", () => {
    expect(isAbsoluteHttpUrl(undefined)).toBe(false);
    expect(isAbsoluteHttpUrl("")).toBe(false);
    expect(isAbsoluteHttpUrl("   ")).toBe(false);
    expect(isAbsoluteHttpUrl("not-a-url")).toBe(false);
    expect(isAbsoluteHttpUrl("happy-animal.convex.cloud")).toBe(false);
    expect(isAbsoluteHttpUrl("wss://happy-animal.convex.cloud")).toBe(false);
  });

  it("accepts absolute http(s) Convex addresses", () => {
    expect(isAbsoluteHttpUrl("https://happy-animal-123.convex.cloud")).toBe(true);
    expect(isAbsoluteHttpUrl("http://127.0.0.1:3210")).toBe(true);
  });

  it("treats a non-absolute NEXT_PUBLIC_CONVEX_URL as unconfigured", () => {
    const env = { NEXT_PUBLIC_CONVEX_URL: "not-an-absolute-url" } as unknown as NodeJS.ProcessEnv;
    expect(readConvexUrl(env)).toBeNull();
    expect(isConvexConfigured(env)).toBe(false);
  });
});
