import { NextResponse } from "next/server";
import { deauthorizeAthlete } from "@fitconnect/strava-integration";
import {
  getConnectionByAthlete,
  markDeauthorized,
  createStravaClientForAthlete
} from "@/lib/integrations/strava/service";
import { resolveIntegrationAthlete } from "@/lib/integrations/strava/route-auth";
import { decryptToken } from "@/lib/integrations/strava/token-crypto";
import { getConnection, upsertConnection } from "@/lib/integrations/store";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "strava");
  if (limited) return limited;
  const body = (await request.json().catch(() => ({}))) as { athleteId?: string };
  const auth = await resolveIntegrationAthlete(request, body.athleteId);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const conn = await getConnectionByAthlete(auth.athleteId);
  const demoConn = getConnection(auth.athleteId, "strava");

  if (!conn && !demoConn) {
    return NextResponse.json({ error: "not_connected" }, { status: 404 });
  }

  if (conn && !conn.deauthorizedAt) {
    const accessToken = decryptToken(conn.accessToken);
    await deauthorizeAthlete(accessToken).catch(() => false);
    await markDeauthorized(conn.stravaAthleteId);
  }

  if (demoConn) {
    upsertConnection({
      ...demoConn,
      status: "disconnected",
      accessToken: undefined,
      refreshToken: undefined
    });
  }

  createStravaClientForAthlete(auth.athleteId);

  return NextResponse.json({ ok: true, disconnected: true });
}
