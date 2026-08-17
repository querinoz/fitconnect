import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";
import { bindSubjectId } from "./authz";
import type { ContextUser } from "./context";

const athlete: ContextUser = { id: "ath-1", role: "athlete" };
const coach: ContextUser = { id: "coach-1", role: "coach" };
const admin: ContextUser = { id: "admin-1", role: "admin" };

describe("bindSubjectId", () => {
  it("binds athletes to themselves", () => {
    expect(bindSubjectId(athlete, "ath-1", "athlete")).toBe("ath-1");
  });

  it("rejects athlete impersonation", () => {
    expect(() => bindSubjectId(athlete, "ath-2", "athlete")).toThrow(TRPCError);
    try {
      bindSubjectId(athlete, "ath-2", "athlete");
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError);
      expect((error as TRPCError).code).toBe("FORBIDDEN");
    }
  });

  it("rejects coaches targeting another coach roster", () => {
    expect(() => bindSubjectId(coach, "coach-2", "coach")).toThrow(TRPCError);
  });

  it("rejects coaches reading athlete-owned strava/wearables", () => {
    expect(() => bindSubjectId(coach, "ath-1", "athlete")).toThrow(TRPCError);
  });

  it("allows admin impersonation", () => {
    expect(bindSubjectId(admin, "ath-9", "athlete")).toBe("ath-9");
    expect(bindSubjectId(admin, "coach-9", "coach")).toBe("coach-9");
  });
});
