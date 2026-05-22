import { describe, expect, it } from "vitest";
import { isAllowedDemoSessionId } from "./demo-session";

describe("demo session cookie", () => {
  it("allows built-in demo ids", () => {
    expect(isAllowedDemoSessionId("athlete")).toBe(true);
    expect(isAllowedDemoSessionId("coach")).toBe(true);
  });

  it("allows registered demo signup ids", () => {
    expect(isAllowedDemoSessionId("user-123")).toBe(true);
  });

  it("rejects unknown ids", () => {
    expect(isAllowedDemoSessionId("hacker")).toBe(false);
    expect(isAllowedDemoSessionId("")).toBe(false);
  });
});
