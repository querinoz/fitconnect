import { NextResponse } from "next/server";
import { stravaAuthUrl } from "@/lib/integrations/strava/oauth";
import { signOAuthState } from "@/lib/integrations/strava/oauth-state";
import { resolveIntegrationAthlete } from "@/lib/integrations/strava/route-auth";
import { seedDemoStrava } from "@/lib/integrations/store";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { isProductionSecurityMode } from "@/lib/security/runtime";

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "strava");
  if (limited) return limited;

  const { searchParams, origin } = new URL(request.url);
  const auth = await resolveIntegrationAthlete(request, searchParams.get("athleteId"));
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let state: string;
  try {
    state = signOAuthState(auth.athleteId);
  } catch {
    return NextResponse.json({ error: "oauth_state_secret_missing" }, { status: 503 });
  }

  const url = stravaAuthUrl(state, origin);
  if (url) {
    return NextResponse.redirect(url);
  }

  if (isProductionSecurityMode()) {
    return NextResponse.json({ error: "strava_not_configured" }, { status: 503 });
  }

  seedDemoStrava(auth.athleteId);
  const dest = new URL("/dashboard", origin);
  dest.searchParams.set("strava", "demo");
  return NextResponse.redirect(dest);
}
