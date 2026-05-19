import { NextResponse } from "next/server";
import {
  exchangeStravaCode,
  fetchStravaActivities,
  mapStravaActivity
} from "@/lib/integrations/strava/client";
import { stravaRedirectUri } from "@/lib/integrations/strava/oauth";
import {
  pushLog,
  setActivities,
  upsertConnection
} from "@/lib/integrations/store";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const stateRaw = searchParams.get("state");
  const error = searchParams.get("error");

  const dest = new URL("/dashboard", origin);

  if (error) {
    dest.searchParams.set("strava", "error");
    return NextResponse.redirect(dest);
  }

  if (!code || !stateRaw) {
    dest.searchParams.set("strava", "missing");
    return NextResponse.redirect(dest);
  }

  let athleteId = "a-ines";
  try {
    const parsed = JSON.parse(Buffer.from(stateRaw, "base64url").toString()) as {
      athleteId?: string;
    };
    if (parsed.athleteId) athleteId = parsed.athleteId;
  } catch {
    /* use default */
  }

  const redirectUri = stravaRedirectUri(origin);
  const tokens = await exchangeStravaCode(code, redirectUri);

  if (!tokens) {
    dest.searchParams.set("strava", "token_error");
    return NextResponse.redirect(dest);
  }

  upsertConnection({
    provider: "strava",
    athleteId,
    status: "connected",
    connectedAt: new Date().toISOString(),
    lastSyncAt: new Date().toISOString(),
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: tokens.expires_at,
    externalAthleteId: String(tokens.athlete.id),
    metadata: {
      name: [tokens.athlete.firstname, tokens.athlete.lastname].filter(Boolean).join(" ")
    }
  });

  const raw = await fetchStravaActivities(tokens.access_token, 1, 8);
  setActivities(athleteId, raw.map(mapStravaActivity));
  pushLog({
    provider: "strava",
    at: new Date().toISOString(),
    action: "oauth_connect",
    ok: true,
    detail: `Synced ${raw.length} activities`
  });

  dest.searchParams.set("strava", "connected");
  return NextResponse.redirect(dest);
}
