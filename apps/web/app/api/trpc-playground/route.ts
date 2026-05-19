import { appRouter } from "@fitconnect/api-client";

export async function GET() {
  const caller = appRouter.createCaller({ user: null });
  const health = await caller.health.ping();
  return Response.json({
    playground: true,
    message: "FitConnect tRPC — use /api/trpc/* for procedures",
    health
  });
}
