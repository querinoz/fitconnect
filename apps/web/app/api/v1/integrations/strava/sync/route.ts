import { NextResponse } from "next/server";
import {
  fetchStravaActivities,
  mapStravaActivity,
  refreshStravaToken
} from "@/lib/integrations/strava/client";
import {
  DEMO_STRAVA_ACTIVITIES,
  getConnection,
  pushLog,
  setActivities,
  upsertConnection
} from "@/lib/integrations/store";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { athleteId?: string };
  const athleteId = body.athleteId ?? "a-ines";
  const conn = getConnection(athleteId, "strava");

  if (!conn) {
    return NextResponse.json({ ok: false, error: "not_connected" }, { status: 404 });
  }

  upsertConnection({ ...conn, status: "syncing" });

  try {
    let accessToken = conn.accessToken;

    if (conn.refreshToken && conn.expiresAt && conn.expiresAt * 1000 < Date.now()) {
      const refreshed = await refreshStravaToken(conn.refreshToken);
      if (refreshed) {
        accessToken = refreshed.access_token;
        upsertConnection({
          ...conn,
          accessToken: refreshed.access_token,
          refreshToken: refreshed.refresh_token,
          expiresAt: refreshed.expires_at,
          status: "syncing"
        });
      }
    }

    let activities = DEMO_STRAVA_ACTIVITIES;
    if (accessToken && !conn.metadata?.demo) {
      const raw = await fetchStravaActivities(accessToken, 1, 10);
      activities = raw.map(mapStravaActivity);
    }

    setActivities(athleteId, activities);
    upsertConnection({
      ...conn,
      status: "connected",
      lastSyncAt: new Date().toISOString(),
      accessToken
    });
    pushLog({
      provider: "strava",
      at: new Date().toISOString(),
      action: "manual_sync",
      ok: true,
      detail: `${activities.length} activities`
    });

    return NextResponse.json({ ok: true, count: activities.length, activities });
  } catch (e) {
    upsertConnection({ ...conn, status: "error" });
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
