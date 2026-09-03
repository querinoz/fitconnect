import { appRouter, createContext } from "@fitconnect/api-client";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createStravaTrpcService } from "@/lib/integrations/strava/trpc-service";
import { requireAuth } from "@/lib/api/require-auth";

/**
 * tRPC uses the same Firebase session boundary as REST (`requireAuth`).
 * Legacy Supabase Auth cookie lookup is not the IdP — Firebase UID is.
 */
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      const auth = await requireAuth(req);
      const user = auth.ok ? auth.user : null;
      return createContext({
        user,
        strava: createStravaTrpcService()
      });
    }
  });

export { handler as GET, handler as POST };
