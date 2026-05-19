import type { IntegrationActivity } from "../store";

const STRAVA_API = "https://www.strava.com/api/v3";

export type StravaTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: { id: number; firstname?: string; lastname?: string };
};

export type StravaActivity = {
  id: number;
  name: string;
  type: string;
  distance: number;
  moving_time: number;
  start_date: string;
  average_heartrate?: number;
  total_elevation_gain?: number;
};

export async function exchangeStravaCode(
  code: string,
  redirectUri: string
): Promise<StravaTokenResponse | null> {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri
    })
  });
  if (!res.ok) return null;
  return res.json() as Promise<StravaTokenResponse>;
}

export async function refreshStravaToken(refreshToken: string) {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    })
  });
  if (!res.ok) return null;
  return res.json() as Promise<StravaTokenResponse>;
}

export async function fetchStravaActivities(
  accessToken: string,
  page = 1,
  perPage = 10
): Promise<StravaActivity[]> {
  const res = await fetch(
    `${STRAVA_API}/athlete/activities?page=${page}&per_page=${perPage}`,
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
    type: a.type,
    distanceM: a.distance,
    movingTimeSec: a.moving_time,
    startDate: a.start_date,
    avgHr: a.average_heartrate,
    elevationGainM: a.total_elevation_gain
  };
}

export async function fetchStravaAthlete(accessToken: string) {
  const res = await fetch(`${STRAVA_API}/athlete`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) return null;
  return res.json() as Promise<{ id: number; firstname?: string; lastname?: string }>;
}
