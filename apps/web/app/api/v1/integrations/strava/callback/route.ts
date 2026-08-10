import { NextResponse } from "next/server";
import { exchangeStravaCode, fetchStravaActivities, mapStravaActivity } from "@/lib/integrations/strava/client";
import { stravaRedirectUri } from "@/lib/integrations/strava/oauth";
import { verifyOAuthState } from "@/lib/integrations/strava/oauth-state";
import { pushLog, setActivities, upsertConnection } from "@/lib/integrations/store";
import { saveConnection, syncRecentActivities } from "@/lib/integrations/strava/service";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  if (searchParams.get("format") === "json" && process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    return NextResponse.json({
      accessToken: "demo-access-token",
      refreshToken: "demo-refresh-token",
      expiresAt,
      athlete: { id: 12345, firstname: "Demo", lastname: "Athlete" }
    });
  }

  const dest = new URL("/settings/wearables", origin);

  try {
    const code = searchParams.get("code");
    const stateRaw = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      dest.searchParams.set("strava", "error");
      return NextResponse.redirect(dest);
    }

    if (!code || !stateRaw) {
      dest.searchParams.set("strava", "missing");
      return NextResponse.redirect(dest);
    }

    const athleteId = verifyOAuthState(stateRaw);
    if (!athleteId) {
      dest.searchParams.set("strava", "invalid_state");
      return NextResponse.redirect(dest);
    }

    const redirectUri = stravaRedirectUri(origin);
    const tokens = await exchangeStravaCode(code, redirectUri);

    if (!tokens?.athlete?.id) {
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

    await saveConnection({
      athleteExternalId: athleteId,
      stravaAthleteId: tokens.athlete.id,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expires_at,
      scope: "read,activity:read,activity:read_all,profile:read_all"
    });

    try {
      await syncRecentActivities(athleteId, 2);
    } catch (syncErr) {
      console.error("[strava/callback] sync fallback:", syncErr);
      const raw = await fetchStravaActivities(tokens.access_token, 1, 8);
      setActivities(athleteId, raw.map(mapStravaActivity));
    }

    pushLog({
      provider: "strava",
      at: new Date().toISOString(),
      action: "oauth_connect",
      ok: true,
      detail: "Strava connected"
    });

    dest.searchParams.set("strava", "connected");
    return NextResponse.redirect(dest);
  } catch (err) {
    console.error("[strava/callback]", err);
    dest.searchParams.set("strava", "server_error");
    return NextResponse.redirect(dest);
  }
}
