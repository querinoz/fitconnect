import { NextResponse } from "next/server";
import {
  syncRecentActivities,
  listActivitiesForAthlete,
  toIntegrationActivity,
  getConnectionByAthlete
} from "@/lib/integrations/strava/service";
import {
  DEMO_STRAVA_ACTIVITIES,
  getConnection,
  pushLog,
  setActivities,
  upsertConnection
} from "@/lib/integrations/store";
import { resolveIntegrationAthlete } from "@/lib/integrations/strava/route-auth";
import { getStravaRateLimit } from "@/lib/integrations/strava/rate-limit-cache";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { athleteId?: string };
  const auth = await resolveIntegrationAthlete(request, body.athleteId);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const athleteId = auth.athleteId;
  const conn = getConnection(athleteId, "strava");
  const dbConn = await getConnectionByAthlete(athleteId);

  if (!conn && !dbConn) {
    return NextResponse.json({ ok: false, error: "not_connected" }, { status: 404 });
  }

  if (conn) upsertConnection({ ...conn, status: "syncing" });

  try {
    let activities = DEMO_STRAVA_ACTIVITIES;

    if (dbConn && !dbConn.deauthorizedAt) {
      await syncRecentActivities(athleteId, 2);
      const rows = await listActivitiesForAthlete(athleteId, 10);
      activities = rows.map(toIntegrationActivity);
    } else if (conn?.accessToken && !conn.metadata?.demo) {
      const { fetchStravaActivities, mapStravaActivity } = await import(
        "@/lib/integrations/strava/client"
      );
      const raw = await fetchStravaActivities(conn.accessToken, 1, 10);
      activities = raw.map(mapStravaActivity);
    }

    setActivities(athleteId, activities);
    if (conn) {
      upsertConnection({
        ...conn,
        status: "connected",
        lastSyncAt: new Date().toISOString()
      });
    }

    pushLog({
      provider: "strava",
      at: new Date().toISOString(),
      action: "manual_sync",
      ok: true,
      detail: `${activities.length} activities`
    });

    const rateLimit = getStravaRateLimit();
    return NextResponse.json({ ok: true, count: activities.length, activities, rateLimit });
  } catch (e) {
    if (conn) upsertConnection({ ...conn, status: "error" });
    pushLog({
      provider: "strava",
      at: new Date().toISOString(),
      action: "manual_sync",
      ok: false,
      detail: String(e)
    });
    return NextResponse.json({ ok: false, error: "sync_failed" }, { status: 500 });
  }
}
