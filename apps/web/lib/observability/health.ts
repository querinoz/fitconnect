import { isFirebaseWebConfigured } from "@/lib/firebase/config";
import { resolveRateLimitBackend } from "@/lib/security/rate-limit";
import { stripeCheckoutMode, stripeHealthDetail } from "@/lib/stripe/mode";

export type HealthDependency = {
  name: string;
  status: "ok" | "degraded" | "down";
  detail?: string;
};

export type HealthReport = {
  status: "ok" | "degraded";
  timestamp: string;
  version: string;
  dependencies: HealthDependency[];
};

function configured(env: NodeJS.ProcessEnv, key: string): boolean {
  const v = env[key]?.trim();
  return Boolean(v && !v.includes("PASTE_") && !v.includes("your-"));
}

export function buildHealthReport(env: NodeJS.ProcessEnv = process.env): HealthReport {
  const deps: HealthDependency[] = [];

  const demoMode = env.NEXT_PUBLIC_DEMO_MODE === "true";
  const firebaseReady = isFirebaseWebConfigured(env);

  // Auth authority is Firebase IdP — not Supabase Auth.
  deps.push({
    name: "auth",
    status: demoMode ? "ok" : firebaseReady ? "ok" : "down",
    detail: demoMode
      ? "demo mode (LOCAL_DEMO)"
      : firebaseReady
        ? "firebase idp"
        : "AUTH_UNAVAILABLE — firebase web config missing"
  });

  deps.push({
    name: "database",
    status: configured(env, "DATABASE_URL") ? "ok" : "degraded",
    detail: configured(env, "DATABASE_URL") ? "postgresql" : "DATABASE_URL not set"
  });

  const stripeMode = stripeCheckoutMode(env);
  deps.push({
    name: "stripe",
    status: stripeMode === "none" ? "degraded" : "ok",
    detail: stripeHealthDetail(stripeMode)
  });

  const stravaReady =
    configured(env, "STRAVA_CLIENT_ID") && configured(env, "STRAVA_CLIENT_SECRET");
  deps.push({
    name: "strava",
    status: stravaReady ? "ok" : "degraded",
    detail: stravaReady
      ? "oauth configured"
      : demoMode
        ? "demo strava fallback"
        : "oauth not configured"
  });

  const redisBackend = resolveRateLimitBackend(env);
  deps.push({
    name: "redis",
    status: redisBackend === "upstash" ? "ok" : demoMode ? "ok" : "degraded",
    detail:
      redisBackend === "upstash"
        ? "upstash rate limit"
        : redisBackend === "skipped"
          ? "rate limit skipped (LOCAL_DEMO)"
          : "in-memory rate limit (upstash unset)"
  });

  const firstPartyAnalytics = configured(env, "DATABASE_URL");
  deps.push({
    name: "analytics",
    status:
      configured(env, "NEXT_PUBLIC_POSTHOG_KEY") ||
      configured(env, "NEXT_PUBLIC_SENTRY_DSN") ||
      firstPartyAnalytics
        ? "ok"
        : "degraded",
    detail: [
      configured(env, "NEXT_PUBLIC_POSTHOG_KEY") ? "posthog" : null,
      configured(env, "NEXT_PUBLIC_SENTRY_DSN") ? "sentry" : null,
      firstPartyAnalytics ? "first-party events" : null
    ]
      .filter(Boolean)
      .join(" + ") || "not configured"
  });

  deps.push({
    name: "firebase",
    status: firebaseReady ? "ok" : "down",
    detail: firebaseReady
      ? [
          "web sdk",
          configured(env, "NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY") ? "app check" : null,
          configured(env, "NEXT_PUBLIC_FIREBASE_VAPID_KEY") ? "fcm" : null
        ]
          .filter(Boolean)
          .join(" + ")
      : "not configured"
  });

  deps.push({
    name: "supabase_data",
    status:
      configured(env, "NEXT_PUBLIC_SUPABASE_URL") && configured(env, "NEXT_PUBLIC_SUPABASE_ANON_KEY")
        ? "ok"
        : "degraded",
    detail: "DATABASE / RLS plane — not IdP"
  });

  deps.push({
    name: "realtime",
    status: "ok",
    detail: resolveRealtimeDetail(env)
  });

  const hasDown = !demoMode && deps.some((d) => d.status === "down");
  const hasDegraded = !demoMode && deps.some((d) => d.status !== "ok");

  return {
    status: hasDown || hasDegraded ? "degraded" : "ok",
    timestamp: new Date().toISOString(),
    version: env.npm_package_version ?? "0.1.0",
    dependencies: deps
  };
}

function resolveRealtimeDetail(env: NodeJS.ProcessEnv): string {
  const provider = env.NEXT_PUBLIC_REALTIME_PROVIDER ?? "broadcast";
  const convexUrl = env.NEXT_PUBLIC_CONVEX_URL?.trim() ?? "";
  const convexOk = /^https?:\/\//i.test(convexUrl);
  if (provider === "convex" && convexOk) {
    return "convex";
  }
  if (provider === "supabase" && env.NEXT_PUBLIC_SUPABASE_URL) {
    return "supabase realtime (NOT authority)";
  }
  return "same-origin broadcast (convex unset)";
}
