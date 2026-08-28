import { isSupabasePersistenceConfigured } from "@/lib/db/supabase-admin";

/** Vitest and explicit memory backend use in-process stores. Production uses Supabase. */
export function isMemoryPersistence(
  env: Record<string, string | undefined> = process.env
): boolean {
  if (env.PERSISTENCE_BACKEND === "memory") return true;
  if (env.VITEST === "true") return true;
  return false;
}

export function persistenceReady(
  env: Record<string, string | undefined> = process.env
): boolean {
  return isMemoryPersistence(env) || isSupabasePersistenceConfigured(env);
}
