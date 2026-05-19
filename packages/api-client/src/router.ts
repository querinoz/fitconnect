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
  health: healthRouter
});

export type AppRouter = typeof appRouter;
