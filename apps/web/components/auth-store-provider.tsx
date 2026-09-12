"use client";

import { useEffect, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { persistClientAuthSession } from "@/lib/auth/complete-login";
import { authBackend } from "@/lib/auth/auth-backend";
import { isAllowedDemoSessionId } from "@/lib/auth/demo-session";

const AuthStoreFirebaseSync = dynamic(
  () => import("@/components/auth-store-firebase-sync").then((m) => m.AuthStoreFirebaseSync),
  { ssr: false }
);

/**
 * Rehydrates the persisted auth store once on the client.
 * Required with `skipHydration` to avoid SSR mismatch and rehydration races.
 */
function AuthStoreRehydrate({ children }: { children: ReactNode }) {
  useEffect(() => {
    void Promise.resolve(useAuthStore.persist.rehydrate()).then(() => {
      const user = useAuthStore.getState().user;
      if (user && authBackend() === "demo" && isAllowedDemoSessionId(user.id)) {
        persistClientAuthSession(user);
      }

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

  return <>{children}</>;
}

export function AuthStoreProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AuthStoreRehydrate>
      {pathname !== "/" ? <AuthStoreFirebaseSync /> : null}
      {children}
    </AuthStoreRehydrate>
  );
}
