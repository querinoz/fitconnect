import type { SessionSummary } from "@fitconnect/types";
import type { ReadinessInputs } from "@/lib/readiness/compute";

/** Realistic athlete IDs from seed data — not arbitrary placeholders. */
export const SEED_ATHLETE_ID = "a-ines";
export const SEED_COACH_ID = "t-002";

export function buildReadinessInput(
  overrides: Partial<ReadinessInputs> = {}
): ReadinessInputs {
  return {
    hrvMs: 62,
    baselineHrvMs: 58,
    sleepHours: 7.4,
    sleepEfficiency: 88,
    strainScore: 32,
    ...overrides
  };
}

export function buildSessionSummary(
  overrides: Partial<SessionSummary> = {}
): SessionSummary {
  return {
    id: "sess-demo-001",
    athleteId: SEED_ATHLETE_ID,
    coachId: SEED_COACH_ID,
    when: "2026-05-20T09:00:00.000Z",
    type: "Threshold run",
    mode: "Online",
    intensity: "moderate",
    status: "scheduled",
    ...overrides
  };
}

export function buildDemoEnv(
  overrides: Record<string, string | undefined> = {}
): NodeJS.ProcessEnv {
  return {
    NODE_ENV: "test",
    NEXT_PUBLIC_DEMO_MODE: "true",
    NEXT_PUBLIC_REALTIME_PROVIDER: "broadcast",
    npm_package_version: "1.0.0",
    ...overrides
  } as NodeJS.ProcessEnv;
}

export function buildProductionEnv(
  overrides: Record<string, string | undefined> = {}
): NodeJS.ProcessEnv {
  return {
    NODE_ENV: "production",
    NEXT_PUBLIC_DEMO_MODE: "false",
    NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
    DATABASE_URL: "postgresql://user:pass@localhost:5432/fitconnect",
    STRIPE_SECRET_KEY: "sk_live_test",
    STRAVA_CLIENT_ID: "12345",
    STRAVA_CLIENT_SECRET: "secret",
    UPSTASH_REDIS_REST_URL: "https://redis.upstash.io",
    UPSTASH_REDIS_REST_TOKEN: "token",
    NEXT_PUBLIC_POSTHOG_KEY: "phc_test",
    ...overrides
  } as NodeJS.ProcessEnv;
}
