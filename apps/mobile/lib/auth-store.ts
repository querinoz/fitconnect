import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type UserRole = "athlete" | "coach" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

const DEMO_USERS: Array<AuthUser & { password: string }> = [
  {
    id: "athlete",
    name: "Inês M.",
    email: "ines@fitconnect.local",
    password: "Athlete",
    role: "athlete"
  },
  {
    id: "coach",
    name: "Tomás Ribeiro",
    email: "tomas@fitconnect.local",
    password: "Coach",
    role: "coach"
  }
];

export function validateCredentials(email: string, password: string): AuthUser | null {
  const match = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );
  if (!match || match.password !== password) return null;
  const { password: _pw, ...user } = match;
  return user;
}

const secureStorage = {
  getItem: (name: string) => SecureStore.getItemAsync(name),
  setItem: (name: string, value: string) => SecureStore.setItemAsync(name, value),
  removeItem: (name: string) => SecureStore.deleteItemAsync(name)
};

type AuthState = {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null })
    }),
    {
      name: "fitconnect-mobile-auth",
      storage: createJSONStorage(() => secureStorage)
    }
  )
);
