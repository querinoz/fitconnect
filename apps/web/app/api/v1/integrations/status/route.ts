import { NextResponse } from "next/server";
import {
  connectionFromPrisma,
  listStravaActivities
} from "@/lib/integrations/strava/repository";
import {
  getConnectionByAthlete,
  isStravaDbEnabled
} from "@/lib/integrations/strava/service";
import { formatSyncAgo } from "@fitconnect/strava-integration";
import { getStravaRateLimit } from "@/lib/integrations/strava/rate-limit-cache";
import {
  getConnection,
  listConnections,
  seedDemoStrava
} from "@/lib/integrations/store";
import type { WearableProvider } from "@fitconnect/types";
import { isAuthFailure, requireAthleteId } from "@/lib/api/require-auth";
import { enforceRateLimit } from "@/lib/security/rate-limit";

const PROVIDER_CATALOG: {
  id: WearableProvider;
  label: string;
  category: string;
  metrics: string[];
  oauth: boolean;
}[] = [
  { id: "strava", label: "Strava", category: "Activities", metrics: ["distance", "pace", "HR", "elevation", "segments"], oauth: true },
  { id: "whoop", label: "Whoop", category: "Recovery", metrics: ["HRV", "recovery", "strain", "sleep"], oauth: true },
  { id: "oura", label: "Oura", category: "Sleep", metrics: ["readiness", "sleep stages", "HRV", "temp"], oauth: true },
  { id: "garmin", label: "Garmin", category: "Training", metrics: ["training load", "VO2", "body battery"], oauth: true },
  { id: "apple_health", label: "Apple Health", category: "HealthKit", metrics: ["HR", "HRV", "workouts", "sleep"], oauth: false },
  { id: "health_connect", label: "Health Connect", category: "Android", metrics: ["steps", "HR", "sleep", "workouts"], oauth: false }
];

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "strava");
  if (limited) return limited;

  const bound = await requireAthleteId(request);
  if (isAuthFailure(bound)) return bound.response;
  const athleteId = bound.athleteId;

  let connections = listConnections(athleteId);
  const useDb = isStravaDbEnabled();

  if (connections.length === 0 && process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    seedDemoStrava(athleteId);
    connections = listConnections(athleteId);
  }

  const stravaConn = getConnection(athleteId, "strava");
  let activityCount = 0;
  let lastSyncAt = stravaConn?.lastSyncAt ?? null;
  let connected = stravaConn?.status === "connected";

  if (useDb) {
    const prismaConn = await connectionFromPrisma(athleteId);
    const dbRow = await getConnectionByAthlete(athleteId);
    if (prismaConn && !dbRow?.deauthorizedAt) {
      connected = true;
      lastSyncAt = prismaConn.lastSyncAt;
      const dbActivities = await listStravaActivities(athleteId, 10);
      activityCount = dbActivities.length;
    }
  } else {
    activityCount = (await import("@/lib/integrations/store")).getActivities(athleteId, 50).length;
  }

  const providers = PROVIDER_CATALOG.map((p) => {
    const conn = connections.find((c) => c.provider === p.id);
    return {
      id: p.id,
      label: p.label,
      category: p.category,
      metrics: p.metrics,
      oauth: p.oauth,
      status: conn?.status ?? (p.id === "strava" && connected ? "connected" : "disconnected"),
      connectedAt: conn?.connectedAt ?? null,
      lastSyncAt: p.id === "strava" ? lastSyncAt : conn?.lastSyncAt ?? null,
      configured: p.id === "strava" ? Boolean(process.env.STRAVA_CLIENT_ID) : false
    };
  });

  const cachedLimits = getStravaRateLimit();
  const rateLimit = cachedLimits
    ? {
        fifteenMin: {
          used: cachedLimits.fifteenMinUsage,
          limit: cachedLimits.fifteenMinLimit
        },
        daily: { used: cachedLimits.dailyUsage, limit: cachedLimits.dailyLimit }
      }
    : {
        fifteenMin: { used: 0, limit: 100 },
        daily: { used: 0, limit: 1000 }
      };

  return NextResponse.json({
    athleteId,
    providers,
    strava: {
      connected,
      lastSyncAt,
      syncLabel: formatSyncAgo(lastSyncAt ? new Date(lastSyncAt) : null),
      activityCount,
      rateLimit
    }
  });
}
