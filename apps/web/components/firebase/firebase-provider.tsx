"use client";

import { useEffect, type ReactNode } from "react";
import { initFirebaseClient } from "@/lib/firebase/client";
import { isFirebaseWebConfigured } from "@/lib/firebase/config";

type FirebaseProviderProps = {
  children: ReactNode;
};

/** Eager Firebase App + App Check bootstrap (auth sync is in AuthStoreProvider). */
export function FirebaseProvider({ children }: FirebaseProviderProps) {
  useEffect(() => {
    if (!isFirebaseWebConfigured()) return;
    void initFirebaseClient();
  }, []);

  return <>{children}</>;
}
