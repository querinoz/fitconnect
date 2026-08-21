import type { UserRole } from "@/lib/auth";

export type AuthSessionState =
  | "SIGNED_OUT"
  | "AUTHENTICATING"
  | "SIGNED_IN"
  | "REFRESHING"
  | "ERROR";

export type AuthSessionProvider = "password" | "google" | "apple" | "demo" | "unknown";

/** Canonical session shape shared conceptually by Android SessionSnapshot and web AuthUser. */
export type AuthSession = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoUrl: string | null;
  provider: AuthSessionProvider;
  isEmailVerified: boolean;
  role: UserRole | null;
  state: AuthSessionState;
};
