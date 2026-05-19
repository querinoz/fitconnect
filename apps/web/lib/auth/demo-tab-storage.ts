import type { StateStorage } from "zustand/middleware";
import type { AuthUser } from "@/lib/auth";

const STORAGE_KEY = "fitconnect-auth";

/** Per-tab demo user injected by Playwright (`addInitScript`). */
export type DemoTabWindow = Window & { __FC_DEMO_USER__?: AuthUser };

/**
 * When `__FC_DEMO_USER__` is set, reads/writes auth for that tab only so athlete + coach
 * can share one browser context (BroadcastChannel) without clobbering localStorage.
 */
export function createDemoTabStorage(): StateStorage {
  return {
    getItem: () => {
      if (typeof window === "undefined") return null;
      const tabUser = (window as DemoTabWindow).__FC_DEMO_USER__;
      if (tabUser) {
        return JSON.stringify({
          state: { user: tabUser, registered: [] },
          version: 0
        });
      }
      return localStorage.getItem(STORAGE_KEY);
    },
    setItem: (_name, value) => {
      if (typeof window === "undefined") return;
      if ((window as DemoTabWindow).__FC_DEMO_USER__) return;
      localStorage.setItem(STORAGE_KEY, value);
    },
    removeItem: () => {
      if (typeof window === "undefined") return;
      localStorage.removeItem(STORAGE_KEY);
    }
  };
}
