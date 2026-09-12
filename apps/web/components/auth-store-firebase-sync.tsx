"use client";

import { useSupabaseAuthSync } from "@/lib/auth/use-supabase-auth-sync";

/** Isolated so the Firebase Auth SDK is not in the marketing landing chunk. */
export function AuthStoreFirebaseSync() {
  useSupabaseAuthSync();
  return null;
}
