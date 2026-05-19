import { z } from "zod";
import { authedProcedure, publicProcedure, router } from "./trpc";

export const authRouter = router({
  me: authedProcedure.query(({ ctx }) => ctx.user)
});

export const coachesRouter = router({
  roster: authedProcedure
    .input(z.object({ coachId: z.string() }))
    .query(({ input }) => ({
      coachId: input.coachId,
      athletes: [] as Array<{
        id: string;
        name: string;
        readiness: number;
        recoveryStatus: string;
      }>
    }))
});

export const sessionsRouter = router({
  list: authedProcedure
    .input(z.object({ athleteId: z.string().optional(), coachId: z.string().optional() }))
    .query(({ input }) => ({
      sessions: [] as Array<{ id: string; when: string; status: string }>,
      filter: input
    }))
});

export const wearablesRouter = router({
  readiness: publicProcedure
    .input(z.object({ athleteId: z.string() }))
    .query(({ input }) => ({
      athleteId: input.athleteId,
      score: 0,
      hrvMs: 0,
      sleepHours: "0",
      recoveryStatus: "green" as const
    }))
});

export const stravaRouter = router({
  status: publicProcedure
    .input(z.object({ athleteId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.strava) return { connected: false, lastSyncAt: null };
      return ctx.strava.connectionStatus(input.athleteId);
    }),

  activities: publicProcedure
    .input(z.object({ athleteId: z.string(), limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.strava) return { activities: [] };
      const activities = await ctx.strava.listActivities(input.athleteId, input.limit);
      return { activities };
    }),

  activity: publicProcedure
    .input(z.object({ athleteId: z.string(), stravaId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.strava) return { activity: null, streams: null };
      return ctx.strava.getActivity(input.athleteId, input.stravaId);
    }),

  sync: publicProcedure
    .input(z.object({ athleteId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.strava) return { ok: false as const, count: 0 };
      const result = await ctx.strava.sync(input.athleteId);
      return { ok: true as const, count: result.count };
    })
});

export const healthRouter = router({
  ping: publicProcedure.query(() => ({
    ok: true as const,
    service: "fitconnect-api",
    timestamp: new Date().toISOString()
  }))
});

export const appRouter = router({
  auth: authRouter,
  coaches: coachesRouter,
  sessions: sessionsRouter,
  wearables: wearablesRouter,
  strava: stravaRouter,
  health: healthRouter
});

export type AppRouter = typeof appRouter;
