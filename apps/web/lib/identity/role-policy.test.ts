import { describe, expect, it } from "vitest";
import {
  capabilitiesFromPlan,
  resolveActiveMode,
  toUserCapabilities
} from "@fitconnect/types";
import { canAssignAppRole, canGrantCapability, parseAppRole } from "./role-policy";

describe("capabilitiesFromPlan", () => {
  it("maps known plans", () => {
    expect(capabilitiesFromPlan("athlete")).toEqual(["athlete"]);
    expect(capabilitiesFromPlan("coach")).toEqual(["coach"]);
    expect(capabilitiesFromPlan("team")).toEqual(["athlete", "coach"]);
  });
});

describe("resolveActiveMode", () => {
  it("prefers owned preference", () => {
    expect(
      resolveActiveMode({
        capabilities: ["athlete", "coach"],
        preferred: "coach"
      })
    ).toBe("coach");
  });

  it("falls back for single capability", () => {
    expect(resolveActiveMode({ capabilities: ["athlete"] })).toBe("athlete");
    expect(resolveActiveMode({ capabilities: ["coach"] })).toBe("coach");
    expect(resolveActiveMode({ capabilities: [] })).toBeNull();
  });
});

describe("toUserCapabilities", () => {
  it("flags athlete/coach", () => {
    const u = toUserCapabilities(["athlete", "coach"]);
    expect(u.athlete).toBe(true);
    expect(u.coach).toBe(true);
  });
});

describe("identity role policy (unified)", () => {
  it("allows first athlete or coach assignment", () => {
    expect(canAssignAppRole(null, "athlete")).toBe(true);
    expect(canAssignAppRole(undefined, "coach")).toBe(true);
  });

  it("denies admin and unknown roles", () => {
    expect(canAssignAppRole(null, "admin")).toBe(false);
    expect(canAssignAppRole(null, "federation")).toBe(false);
  });

  it("does not allow XOR flip via legacy assign helper", () => {
    expect(canAssignAppRole("athlete", "coach")).toBe(false);
    expect(canAssignAppRole("coach", "admin")).toBe(false);
    expect(canAssignAppRole("athlete", "athlete")).toBe(true);
  });

  it("allows granting a second capability", () => {
    expect(canGrantCapability(["athlete"], "coach")).toBe(true);
    expect(canGrantCapability(["athlete", "coach"], "coach")).toBe(false);
  });

  it("parses stored role values", () => {
    expect(parseAppRole("ATHLETE")).toBe("athlete");
    expect(parseAppRole("coach")).toBe("coach");
    expect(parseAppRole("nope")).toBeNull();
  });
});
