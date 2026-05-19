"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "./auth-store";

/** True once persisted auth state has been read from localStorage on the client. */
export function useAuthHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => {
    if (typeof window === "undefined") return false;
    return useAuthStore.persist?.hasHydrated() ?? false;
  });

  useEffect(() => {
    const persist = useAuthStore.persist;
    if (!persist) {
      setHydrated(true);
      return;
    }

    const finish = () => setHydrated(true);

    if (persist.hasHydrated()) {
      finish();
      return;
    }

    const unsub = persist.onFinishHydration(finish);
    void Promise.resolve(persist.rehydrate()).then(finish).catch(finish);

    // Safety net — never block auth UI indefinitely if hydration event was missed
    const timeout = window.setTimeout(finish, 1200);

    return () => {
      unsub?.();
      window.clearTimeout(timeout);
    };
  }, []);

  return hydrated;
}
