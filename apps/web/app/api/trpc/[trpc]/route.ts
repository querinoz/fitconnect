import { appRouter, createContext } from "@fitconnect/api-client";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createStravaTrpcService } from "@/lib/integrations/strava/trpc-service";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () =>
      createContext({
        user: null,
        strava: createStravaTrpcService()
      })
  });

export { handler as GET, handler as POST };
