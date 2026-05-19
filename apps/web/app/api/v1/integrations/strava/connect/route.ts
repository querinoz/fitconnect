import { NextResponse } from "next/server";
import { stravaAuthUrl, stravaRedirectUri } from "@/lib/integrations/strava/oauth";
import { seedDemoStrava } from "@/lib/integrations/store";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const athleteId = searchParams.get("athleteId") ?? "a-ines";
  const redirectUri = stravaRedirectUri(origin);
  const state = Buffer.from(JSON.stringify({ athleteId })).toString("base64url");

  const url = stravaAuthUrl(state, redirectUri);
  if (url) {
    return NextResponse.redirect(url);
  }

  seedDemoStrava(athleteId);
  const dest = new URL("/dashboard", origin);
  dest.searchParams.set("strava", "demo");
  return NextResponse.redirect(dest);
}
