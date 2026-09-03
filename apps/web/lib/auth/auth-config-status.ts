/**
 * Safe auth configuration status for diagnostics (P1-AUTH).
 * Never includes API keys, private keys, tokens, or service-account JSON.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { isFirebaseWebConfigured } from "@/lib/firebase/config";

export type AuthConfigPresence = "PRESENT" | "MISSING";

export type AuthConfigDiagnostic = {
  AUTH_PROVIDER: "FIREBASE";
  DEMO_MODE: "ENABLED" | "DISABLED";
  FIREBASE_WEB_CONFIG: AuthConfigPresence;
  /** ID tokens verified via Google JWKS — Admin SDK not required for session verify. */
  FIREBASE_ADMIN: AuthConfigPresence | "NOT_REQUIRED";
  ANDROID_GOOGLE_SERVICES: AuthConfigPresence;
  SUPABASE_DATA_API: AuthConfigPresence;
  PRODUCTION_AUTH_READY: boolean;
};

function envPresent(env: NodeJS.ProcessEnv, key: string): boolean {
  const v = env[key]?.trim();
  return Boolean(v && !v.includes("PASTE_") && !v.includes("your-") && !v.includes("YOUR_"));
}

export function resolveAndroidGoogleServicesPath(
  repoRoot: string = path.resolve(process.cwd(), "../..")
): string {
  // When called from apps/web, cwd is apps/web → ../.. is monorepo root.
  // When called from scripts at repo root, pass explicit root.
  return path.join(repoRoot, "android", "app", "google-services.json");
}

export function buildAuthConfigDiagnostic(input?: {
  env?: NodeJS.ProcessEnv;
  googleServicesPath?: string;
}): AuthConfigDiagnostic {
  const env = input?.env ?? process.env;
  const googlePath =
    input?.googleServicesPath ??
    path.resolve(process.cwd(), "../../android/app/google-services.json");

  const firebaseWeb = isFirebaseWebConfigured(env);
  const demo = env.NEXT_PUBLIC_DEMO_MODE === "true";
  const androidGs = existsSync(googlePath);
  const supabaseData =
    envPresent(env, "NEXT_PUBLIC_SUPABASE_URL") &&
    envPresent(env, "NEXT_PUBLIC_SUPABASE_ANON_KEY");

  // No firebase-admin package wired for session verify (JWKS). Account delete
  // Auth user wipe remains PENDING_HUMAN — report NOT_REQUIRED for verify path.
  const firebaseAdmin: AuthConfigDiagnostic["FIREBASE_ADMIN"] = "NOT_REQUIRED";

  return {
    AUTH_PROVIDER: "FIREBASE",
    DEMO_MODE: demo ? "ENABLED" : "DISABLED",
    FIREBASE_WEB_CONFIG: firebaseWeb ? "PRESENT" : "MISSING",
    FIREBASE_ADMIN: firebaseAdmin,
    ANDROID_GOOGLE_SERVICES: androidGs ? "PRESENT" : "MISSING",
    SUPABASE_DATA_API: supabaseData ? "PRESENT" : "MISSING",
    // Web SDK + demo-off is engineering session plumbing, not production IdP GO.
    PRODUCTION_AUTH_READY: false
  };
}
