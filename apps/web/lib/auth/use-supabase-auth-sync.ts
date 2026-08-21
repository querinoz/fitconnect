"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { authBackend, signOutSession } from "@/lib/auth/supabase-browser-auth";
import { clearDemoSessionCookie } from "@/lib/auth/demo-session";
import { applyIdentityToAuthUser, bootstrapProfile } from "@/lib/identity/client";
import { initFirebaseClient } from "@/lib/firebase/client";
import { getAuth, onAuthStateChanged } from "firebase/auth";

/**
 * Keeps Zustand auth aligned with Firebase Auth when demo mode is off.
 * Demo mode relies on persisted localStorage only.
 */
export function useSupabaseAuthSync() {
  useEffect(() => {
    if (authBackend() !== "firebase") return;
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    void initFirebaseClient().then((app) => {
      if (!app || cancelled) return;
      const auth = getAuth(app);
      unsubscribe = onAuthStateChanged(auth, (user) => {
        if (cancelled) return;
        if (!user) {
          useAuthStore.getState().logout();
          return;
        }
        const mapped = {
          id: user.uid,
          username: (user.email ?? user.uid).split("@")[0] || user.uid.slice(0, 8),
          name: user.displayName || user.email || user.uid,
          email: user.email ?? "",
          role: "athlete" as const,
          athleteId: user.uid
        };
        void bootstrapProfile({
          email: user.email ?? undefined,
          displayName: user.displayName ?? undefined,
          avatarUrl: user.photoURL ?? undefined
        }).then((profile) => {
          if (cancelled) return;
          useAuthStore.getState().login(applyIdentityToAuthUser(mapped, profile));
        });
      });
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);
}

/** Log out demo Zustand state and Firebase session when configured. */
export async function logoutAuthSession() {
  useAuthStore.getState().logout();
  clearDemoSessionCookie();
  await signOutSession();
}
