import { describe, expect, it } from "vitest";
import { canAssignAppRole, parseAppRole } from "./role-policy";

describe("identity role policy", () => {
  it("allows first athlete or coach assignment", () => {
    expect(canAssignAppRole(null, "athlete")).toBe(true);
    expect(canAssignAppRole(undefined, "coach")).toBe(true);
  });

  it("denies admin and unknown roles", () => {
    expect(canAssignAppRole(null, "admin")).toBe(false);
    expect(canAssignAppRole(null, "federation")).toBe(false);
  });

  it("locks an existing role against escalation", () => {
    expect(canAssignAppRole("athlete", "coach")).toBe(false);
    expect(canAssignAppRole("coach", "admin")).toBe(false);
    expect(canAssignAppRole("athlete", "athlete")).toBe(true);
  });

  it("parses stored role values", () => {
    expect(parseAppRole("ATHLETE")).toBe("athlete");
    expect(parseAppRole("coach")).toBe("coach");
    expect(parseAppRole("nope")).toBeNull();
  });
});
