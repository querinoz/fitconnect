import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";
import { appRouter } from "./router";

const athlete = { id: "ath-1", role: "athlete" as const, email: "a@fitconnect.app" };
const other = { id: "ath-2", role: "athlete" as const, email: "b@fitconnect.app" };
const coach = { id: "coach-1", role: "coach" as const, email: "c@fitconnect.app" };

describe("tRPC authorization", () => {
  it("rejects anonymous strava and wearables", async () => {
    const caller = appRouter.createCaller({ user: null });
    await expect(caller.strava.status({ athleteId: "ath-1" })).rejects.toMatchObject({
      code: "UNAUTHORIZED"
    });
    await expect(caller.wearables.readiness({ athleteId: "ath-1" })).rejects.toMatchObject({
      code: "UNAUTHORIZED"
    });
  });

  it("allows health ping anonymously", async () => {
    const caller = appRouter.createCaller({ user: null });
    const ping = await caller.health.ping();
    expect(ping.ok).toBe(true);
  });

  it("rejects athlete strava IDOR", async () => {
    const caller = appRouter.createCaller({ user: athlete });
    await expect(caller.strava.status({ athleteId: other.id })).rejects.toBeInstanceOf(TRPCError);
  });

  it("binds strava status to the authenticated athlete", async () => {
    const caller = appRouter.createCaller({ user: athlete });
    const status = await caller.strava.status({ athleteId: athlete.id });
    expect(status.connected).toBe(false);
  });

  it("rejects coach roster IDOR", async () => {
    const caller = appRouter.createCaller({ user: coach });
    await expect(caller.coaches.roster({ coachId: "coach-2" })).rejects.toMatchObject({
      code: "FORBIDDEN"
    });
  });

  it("returns own coach roster id", async () => {
    const caller = appRouter.createCaller({ user: coach });
    const roster = await caller.coaches.roster({ coachId: coach.id });
    expect(roster.coachId).toBe(coach.id);
  });
});
