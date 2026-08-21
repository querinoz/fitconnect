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

function envValue(env: NodeJS.ProcessEnv, key: string): string | null {
  const value = env[key]?.trim();
  if (!value || value.includes("PASTE_") || value.includes("your-")) return null;
  return value;
}

export function readFirebaseWebOptions(
  env: NodeJS.ProcessEnv = process.env
): FirebaseWebOptions {
  const apiKey = envValue(env, "NEXT_PUBLIC_FIREBASE_API_KEY");
  const authDomain = envValue(env, "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  const projectId = envValue(env, "NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  const storageBucket = envValue(env, "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
  const messagingSenderId = envValue(env, "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
  const appId = envValue(env, "NEXT_PUBLIC_FIREBASE_APP_ID");
  const measurementId = envValue(env, "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID") ?? undefined;

  const complete =
    Boolean(apiKey && authDomain && projectId && storageBucket && messagingSenderId && appId);

  const debugRaw = envValue(env, "NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN");
  const providerRaw = envValue(env, "NEXT_PUBLIC_FIREBASE_APPCHECK_PROVIDER");

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
    vapidKey: envValue(env, "NEXT_PUBLIC_FIREBASE_VAPID_KEY"),
    appCheckSiteKey: envValue(env, "NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY"),
    appCheckProvider: providerRaw === "enterprise" ? "enterprise" : "recaptcha",
    appCheckDebugToken: debugRaw === "true" ? true : debugRaw
  };
}

export function isFirebaseWebConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return readFirebaseWebOptions(env).app !== null;
}
