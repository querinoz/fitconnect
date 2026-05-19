/** @deprecated Use @fitconnect/strava-integration — kept for backward compatibility. */
export {
  StravaClient,
  buildStravaAuthorizeUrl,
  buildStravaCallbackUri,
  STRAVA_DEFAULT_SCOPES,
  normalizeSummaryActivity,
  formatSyncAgo
} from "@fitconnect/strava-integration";

export type { StravaTokenResponseInput as StravaTokenResponse } from "@fitconnect/strava-integration";

import { StravaClient } from "@fitconnect/strava-integration";
import type { IntegrationActivity } from "../store";

export type StravaActivity = {
  id: number;
  name: string;
  type: string;
  sport_type?: string;
  distance: number;
  moving_time: number;
  elapsed_time?: number;
  start_date: string;
  average_heartrate?: number;
  total_elevation_gain?: number;
};

export async function exchangeStravaCode(code: string, redirectUri: string) {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return StravaClient.exchangeCode(clientId, clientSecret, code, redirectUri);
}

export async function refreshStravaToken(refreshToken: string) {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return StravaClient.refreshAccessToken(clientId, clientSecret, refreshToken);
}

export async function fetchStravaActivities(
  accessToken: string,
  page = 1,
  perPage = 10
): Promise<StravaActivity[]> {
  const res = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) return [];
  return res.json() as Promise<StravaActivity[]>;
}

export function mapStravaActivity(a: StravaActivity): IntegrationActivity {
  return {
    id: String(a.id),
    provider: "strava",
    name: a.name,
    type: a.sport_type ?? a.type,
    distanceM: a.distance,
    movingTimeSec: a.moving_time,
    startDate: a.start_date,
    avgHr: a.average_heartrate,
    elevationGainM: a.total_elevation_gain
  };
}

export async function fetchStravaAthlete(accessToken: string) {
  const res = await fetch("https://www.strava.com/api/v3/athlete", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) return null;
  return res.json() as Promise<{ id: number; firstname?: string; lastname?: string }>;
}
