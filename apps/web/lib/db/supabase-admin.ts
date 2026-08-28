import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Server-only Supabase client (service_role). Never expose to the browser. */
export function createSupabaseAdminClient(
  env: Record<string, string | undefined> = process.env
): SupabaseClient | null {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;

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
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() &&
      env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
}
