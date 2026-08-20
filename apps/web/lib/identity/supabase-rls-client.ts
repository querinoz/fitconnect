import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * User-scoped Supabase client. The Firebase ID token is the access token.
 * Never uses service_role. RLS is the authorization layer.
 */
export function createSupabaseRlsClient(
  accessToken: string,
  env: Record<string, string | undefined> = process.env
): SupabaseClient | null {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key || !accessToken) return null;

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });
}
