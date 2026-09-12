import { isDemoModeEnv } from "@/lib/auth/middleware-auth";
import { isFirebaseWebConfigured } from "@/lib/firebase/config";

export type AuthBackend = "demo" | "firebase" | "unconfigured";

/** Env-only backend selector. Must not import the Firebase SDK. */
export function authBackend(): AuthBackend {
  if (isDemoModeEnv(process.env.NEXT_PUBLIC_DEMO_MODE)) return "demo";
  if (isFirebaseWebConfigured()) return "firebase";
  return "unconfigured";
}
