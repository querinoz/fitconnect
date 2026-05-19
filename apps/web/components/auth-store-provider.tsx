"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/lib/auth-store";

/**
 * Rehydrates the persisted auth store once on the client.
 * Required with `skipHydration` to avoid SSR mismatch and rehydration races.
 */
export function AuthStoreProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void Promise.resolve(useAuthStore.persist.rehydrate()).then(() => {
      if (process.env.NODE_ENV === "production") return;
      const override = (
        window as Window & {
          __FC_DEMO_USER__?: import("@/lib/auth").AuthUser;
        }
      ).__FC_DEMO_USER__;
      if (override) useAuthStore.setState({ user: override });
    });
    if (process.env.NODE_ENV !== "production") {
      (
        window as Window & {
          __setDemoUser?: (user: import("@/lib/auth").AuthUser | null) => void;
        }
      ).__setDemoUser = (user) => {
        useAuthStore.setState({ user });
      };
    }
  }, []);

  return children;
}
