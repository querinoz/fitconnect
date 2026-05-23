import { createSupabaseServerClient } from "@/lib/auth/supabase/server";
import { createStravaTrpcService } from "@/lib/integrations/strava/trpc-service";
import { appRouter, createContext } from "@fitconnect/api-client";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { ContextUser } from "@fitconnect/api-client";

async function resolveTrpcUser(): Promise<ContextUser | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;
  const meta = user.user_metadata ?? {};
  const roleRaw = (meta.role as string | undefined)?.toLowerCase();
  const role: ContextUser["role"] =
    roleRaw === "coach" ? "coach" : roleRaw === "admin" ? "admin" : "athlete";
  return { id: user.id, role, email: user.email };
}

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      const user = await resolveTrpcUser();
      return createContext({
        user,
        strava: createStravaTrpcService()
      });
    }
  });

export { handler as GET, handler as POST };
