import { z } from "zod";
import { bindSubjectId } from "./authz";
import { authedProcedure, publicProcedure, router } from "./trpc";

export const authRouter = router({
  me: authedProcedure.query(({ ctx }) => ctx.user)
});

export const coachesRouter = router({
  roster: authedProcedure
    .input(z.object({ coachId: z.string() }))
    .query(({ ctx, input }) => {
      const coachId = bindSubjectId(ctx.user, input.coachId, "coach");
      return {
        coachId,
        athletes: [] as Array<{
          id: string;
          name: string;
          readiness: number;
          recoveryStatus: string;
        }>
      };
    })
});

export const sessionsRouter = router({
  list: authedProcedure
    .input(z.object({ athleteId: z.string().optional(), coachId: z.string().optional() }))
    .query(({ ctx, input }) => {
      if (ctx.user.role === "admin") {
        return {
          sessions: [] as Array<{ id: string; when: string; status: string }>,
          filter: input
        };
      }
      if (ctx.user.role === "coach") {
        const coachId = bindSubjectId(ctx.user, input.coachId ?? ctx.user.id, "coach");
        return {
          sessions: [] as Array<{ id: string; when: string; status: string }>,
          filter: { ...input, coachId }
        };
      }
      const athleteId = bindSubjectId(ctx.user, input.athleteId ?? ctx.user.id, "athlete");
      return {
        sessions: [] as Array<{ id: string; when: string; status: string }>,
        filter: { athleteId, coachId: undefined }
      };
    })
});

export const wearablesRouter = router({
  readiness: authedProcedure
    .input(z.object({ athleteId: z.string() }))
    .query(({ ctx, input }) => {
      const athleteId = bindSubjectId(ctx.user, input.athleteId, "athlete");
      return {
        athleteId,
        score: 0,
        hrvMs: 0,
        sleepHours: "0",
        recoveryStatus: "green" as const
      };
    })
});

export const stravaRouter = router({
  status: authedProcedure
    .input(z.object({ athleteId: z.string() }))
    .query(async ({ ctx, input }) => {
      const athleteId = bindSubjectId(ctx.user, input.athleteId, "athlete");
      if (!ctx.strava) return { connected: false, lastSyncAt: null };
      return ctx.strava.connectionStatus(athleteId);
    }),

  activities: authedProcedure
    .input(z.object({ athleteId: z.string(), limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ ctx, input }) => {
      const athleteId = bindSubjectId(ctx.user, input.athleteId, "athlete");
      if (!ctx.strava) return { activities: [] };
      const activities = await ctx.strava.listActivities(athleteId, input.limit);
      return { activities };
    }),

  activity: authedProcedure
    .input(z.object({ athleteId: z.string(), stravaId: z.number() }))
    .query(async ({ ctx, input }) => {
      const athleteId = bindSubjectId(ctx.user, input.athleteId, "athlete");
      if (!ctx.strava) return { activity: null, streams: null };
      return ctx.strava.getActivity(athleteId, input.stravaId);
    }),

  sync: authedProcedure
    .input(z.object({ athleteId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const athleteId = bindSubjectId(ctx.user, input.athleteId, "athlete");
      if (!ctx.strava) return { ok: false as const, count: 0 };
      const result = await ctx.strava.sync(athleteId);
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
