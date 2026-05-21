/**
 * FitConnect elite platform — locked stack decisions.
 * Source: docs/superpowers/specs/2026-05-18-fitconnect-elite-platform-design.md
 */

export const PLATFORM_PHASE = {
  current: 6,
  label: "Community + maps"
} as const;

export type RealtimeProvider = "broadcast" | "convex" | "supabase";

/** Resolved at runtime; broadcast = current BroadcastChannel demo. */
export function getRealtimeProvider(): RealtimeProvider {
  const raw = process.env.NEXT_PUBLIC_REALTIME_PROVIDER;
  if (raw === "convex" || raw === "supabase" || raw === "broadcast") {
    return raw;
  }
  return "broadcast";
}

export const STACK = {
  web: {
    framework: "Next.js",
    targetVersion: "15",
    styling: "Tailwind CSS v4",
    motion: ["Framer Motion", "GSAP (marketing only)"]
  },
  mobile: {
    framework: "Expo",
    router: "Expo Router",
    animation: "Reanimated 3",
    storage: "MMKV"
  },
  realtime: {
    primary: "Convex",
    auth: "Supabase Auth"
  },
  data: {
    database: "PostgreSQL (Neon)",
    orm: "Prisma",
    cache: "Upstash Redis",
    search: "Typesense"
  },
  health: {
    orchestration: "Temporal.io",
    integrations: [
      "Apple HealthKit",
      "Google Health Connect",
      "Garmin",
      "Whoop",
      "Oura",
      "Polar",
      "Strava"
    ]
  },
  maps: ["MapLibre GL", "OpenFreeMap", "Turf.js", "Deck.gl"],
  video: "LiveKit",
  ai: ["OpenAI", "LangGraph", "pgvector"],
  notifications: ["Novu", "Expo Push", "Resend"],
  observability: ["Sentry", "PostHog", "OpenTelemetry"]
} as const;

export const PLATFORM_MOAT = [
  "verified specialists",
  "recovery-aware realtime coaching",
  "multi-sport athlete identity",
  "unified biometric intelligence",
  "premium UX consistency"
] as const;
