import { NextResponse } from "next/server";
import { STRAVA_ENDPOINT_CATALOG } from "@fitconnect/strava-integration";

/** Catalog of Strava API v3 endpoints exposed via /api/v1/integrations/strava/v3/* */
export async function GET() {
  return NextResponse.json({
    basePath: "/api/v1/integrations/strava/v3",
    stravaReference: "https://developers.strava.com/playground/",
    endpoints: STRAVA_ENDPOINT_CATALOG,
    notes: [
      "Append ?athleteId= for demo mode; production uses session cookie.",
      "POST /activities and /uploads require activity:write scope.",
      "PUT /athlete requires profile:write scope.",
      "GET /segment_efforts* may require Strava Summit subscription."
    ]
  });
}
