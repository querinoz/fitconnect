export type FirebasePublicConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

export type FirebaseWebOptions = {
  app: FirebasePublicConfig | null;
  vapidKey: string | null;
  appCheckSiteKey: string | null;
  appCheckProvider: "recaptcha" | "enterprise";
  appCheckDebugToken: string | true | null;
};

function sanitize(value: string | undefined | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.includes("PASTE_") || trimmed.includes("your-") || trimmed.includes("YOUR_")) {
    return null;
  }
  return trimmed;
}

/**
 * Static member access so Next.js inlines NEXT_PUBLIC_* at build time.
 * Dynamic `env[key]` reads Vercel runtime env, which does not receive
 * GitHub environment secrets injected during `vercel build --prod`.
 */
const BUILD_TIME_FIREBASE_WEB = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  NEXT_PUBLIC_FIREBASE_VAPID_KEY: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY: process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY,
  NEXT_PUBLIC_FIREBASE_APPCHECK_PROVIDER: process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_PROVIDER,
  NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN: process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN
};

function pick(env: NodeJS.ProcessEnv, key: keyof typeof BUILD_TIME_FIREBASE_WEB): string | null {
  if (Object.prototype.hasOwnProperty.call(env, key)) {
    return sanitize(env[key]);
  }
  return sanitize(BUILD_TIME_FIREBASE_WEB[key]);
}

export function readFirebaseWebOptions(
  env: NodeJS.ProcessEnv = process.env
): FirebaseWebOptions {
  const apiKey = pick(env, "NEXT_PUBLIC_FIREBASE_API_KEY");
  const authDomain = pick(env, "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  const projectId = pick(env, "NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  const storageBucket = pick(env, "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
  const messagingSenderId = pick(env, "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
  const appId = pick(env, "NEXT_PUBLIC_FIREBASE_APP_ID");
  const measurementId = pick(env, "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID") ?? undefined;

  const complete =
    Boolean(apiKey && authDomain && projectId && storageBucket && messagingSenderId && appId);

  const debugRaw = pick(env, "NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN");
  const providerRaw = pick(env, "NEXT_PUBLIC_FIREBASE_APPCHECK_PROVIDER");

  return {
    app: complete
      ? {
          apiKey: apiKey!,
          authDomain: authDomain!,
          projectId: projectId!,
          storageBucket: storageBucket!,
          messagingSenderId: messagingSenderId!,
          appId: appId!,
          measurementId
        }
      : null,
    vapidKey: pick(env, "NEXT_PUBLIC_FIREBASE_VAPID_KEY"),
    appCheckSiteKey: pick(env, "NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY"),
    appCheckProvider: providerRaw === "enterprise" ? "enterprise" : "recaptcha",
    appCheckDebugToken: debugRaw === "true" ? true : debugRaw
  };
}

export function isFirebaseWebConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return readFirebaseWebOptions(env).app !== null;
}
