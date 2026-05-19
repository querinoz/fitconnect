"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthUser, DemoCredential } from "./auth";
import { createDemoTabStorage } from "./auth/demo-tab-storage";

type AuthState = {
  user: AuthUser | null;
  registered: DemoCredential[];
  login: (user: AuthUser) => void;
  logout: () => void;
  registerDemo: (cred: DemoCredential) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      registered: [],
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
      registerDemo: (cred) =>
        set((s) => ({ registered: [...s.registered, cred] }))
    }),
    {
      name: "fitconnect-auth",
      skipHydration: true,
      storage: createJSONStorage(() => createDemoTabStorage()),
      partialize: (state) => ({
        user: state.user,
        registered: state.registered
      })
    }
  )
);
