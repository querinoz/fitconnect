import { NextResponse } from "next/server";
import {
  DEMO_STRAVA_ACTIVITIES,
  getActivities,
  getConnection,
  getLogs,
  listConnections,
  seedDemoStrava
} from "@/lib/integrations/store";
import type { WearableProvider } from "@fitconnect/types";

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
  const { searchParams } = new URL(request.url);
  const athleteId = searchParams.get("athleteId") ?? "a-ines";

  let connections = listConnections(athleteId);
  if (connections.length === 0 && process.env.NEXT_PUBLIC_DEMO_MODE !== "false") {
    seedDemoStrava(athleteId);
    connections = listConnections(athleteId);
  }

  const stravaConn = getConnection(athleteId, "strava");
  const activities = getActivities(athleteId, 5);

  const providers = PROVIDER_CATALOG.map((p) => {
    const conn = connections.find((c) => c.provider === p.id);
    return {
      ...p,
      status: conn?.status ?? "disconnected",
      connectedAt: conn?.connectedAt ?? null,
      lastSyncAt: conn?.lastSyncAt ?? null,
      configured: p.id === "strava" ? Boolean(process.env.STRAVA_CLIENT_ID) : false
    };
  });

  return NextResponse.json({
    athleteId,
    providers,
    strava: {
      connected: stravaConn?.status === "connected",
      lastSyncAt: stravaConn?.lastSyncAt,
      activityCount: activities.length,
      activities,
      rateLimit: {
        fifteenMin: { used: 12, limit: 100 },
        daily: { used: 340, limit: 1000 }
      }
    },
    syncLogs: getLogs(6),
    demoActivitiesAvailable: DEMO_STRAVA_ACTIVITIES.length
  });
}
