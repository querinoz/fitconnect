import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Server-only Supabase client (service_role). Never expose to the browser. */
export function createSupabaseAdminClient(
  env: Record<string, string | undefined> = process.env
): SupabaseClient | null {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key || key.includes("PASTE")) return null;

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

export function isSupabasePersistenceConfigured(
  env: Record<string, string | undefined> = process.env
): boolean {
  const hasUrl = Boolean(env.NEXT_PUBLIC_SUPABASE_URL?.trim());
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const service = env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  const hasKeys =
    anon.length > 20 &&
    !anon.includes("PASTE") &&
    service.length > 20 &&
    !service.includes("PASTE");
  const hasDb = Boolean(env.DATABASE_URL?.trim());
  return hasUrl && (hasKeys || hasDb);
}
