"use client";

import { useAuthStore } from "@/lib/auth-store";
import {
  clearDemoSessionCookie,
  isAllowedDemoSessionId,
  setDemoSessionCookie
} from "@/lib/auth/demo-session";
import type { AuthUser } from "@/lib/auth";

/** Sync Zustand + middleware cookie so protected routes work on hybrid Supabase/demo deploys. */
export function persistClientAuthSession(
  authUser: AuthUser,
  options?: { persistDemoCookie?: boolean }
) {
  useAuthStore.getState().login(authUser);

  const shouldPersistDemo =
    options?.persistDemoCookie !== false && isAllowedDemoSessionId(authUser.id);

  if (shouldPersistDemo) {
    setDemoSessionCookie(authUser.id);
  } else {
    clearDemoSessionCookie();
  }
}

/** Hard navigation ensures middleware sees the session cookie on the next request. */
export function navigateAfterLogin(target: string) {
  if (typeof window === "undefined") return;
  window.location.assign(target);
}

export function completeClientLogin(
  authUser: AuthUser,
  target: string,
  options?: { persistDemoCookie?: boolean }
) {
  persistClientAuthSession(authUser, options);
  navigateAfterLogin(target);
}
