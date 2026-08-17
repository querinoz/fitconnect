import { appRouter } from "@fitconnect/api-client";
import { isDemoMode } from "@/lib/auth/supabase/client";

export async function GET() {
  if (!isDemoMode()) {
    return new Response(null, { status: 404 });
  }

  const caller = appRouter.createCaller({ user: null });
  const health = await caller.health.ping();
  return Response.json({
    playground: true,
    message: "FitConnect tRPC — use /api/trpc/* for procedures",
    health
  });
}
