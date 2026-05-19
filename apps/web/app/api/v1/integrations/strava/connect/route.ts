import { NextResponse } from "next/server";
import { stravaAuthUrl, stravaRedirectUri } from "@/lib/integrations/strava/oauth";
import { signOAuthState } from "@/lib/integrations/strava/oauth-state";
import { resolveIntegrationAthlete } from "@/lib/integrations/strava/route-auth";
import { seedDemoStrava } from "@/lib/integrations/store";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const auth = await resolveIntegrationAthlete(request, searchParams.get("athleteId"));
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const redirectUri = stravaRedirectUri(origin);
  const state = signOAuthState(auth.athleteId);

  const url = stravaAuthUrl(state, redirectUri);
  if (url) {
    return NextResponse.redirect(url);
  }

  seedDemoStrava(auth.athleteId);
  const dest = new URL("/dashboard", origin);
  dest.searchParams.set("strava", "demo");
  return NextResponse.redirect(dest);
}
