"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/lib/auth-store";

/**
 * Rehydrates the persisted auth store once on the client.
 * Required with `skipHydration` to avoid SSR mismatch and rehydration races.
 */
export function AuthStoreProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void useAuthStore.persist.rehydrate();
  }, []);

  return children;
}
