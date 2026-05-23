"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import {
  authBackend,
  signOutSession
} from "@/lib/auth/supabase-browser-auth";
import { mapSupabaseUserToAuthUser } from "@/lib/auth/map-supabase-user";
import { createSupabaseBrowserClient } from "@/lib/auth/supabase/client";
import { clearDemoSessionCookie } from "@/lib/auth/demo-session";

/**
 * Keeps Zustand auth aligned with Supabase session when demo mode is off.
 * Demo mode relies on persisted localStorage only.
 */
export function useSupabaseAuthSync() {
  useEffect(() => {
    if (authBackend() !== "supabase") return;

    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    let cancelled = false;

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session?.user) {
        useAuthStore.getState().login(mapSupabaseUserToAuthUser(session.user));
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        useAuthStore.getState().logout();
        return;
      }
      if (session?.user && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
        useAuthStore.getState().login(mapSupabaseUserToAuthUser(session.user));
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);
}

/** Log out demo Zustand state and Supabase session when configured. */
export async function logoutAuthSession() {
  useAuthStore.getState().logout();
  clearDemoSessionCookie();
  await signOutSession();
}
