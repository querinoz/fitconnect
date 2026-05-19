/** Strava OAuth scopes for FitConnect specialist coaching platform. */
export const STRAVA_SCOPES = [
  "read",
  "activity:read",
  "activity:read_all",
  "profile:read_all"
] as const;

export function stravaAuthUrl(state: string, redirectUri: string) {
  const clientId = process.env.STRAVA_CLIENT_ID;
  if (!clientId) return null;
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    approval_prompt: "auto",
    scope: STRAVA_SCOPES.join(","),
    state
  });
  return `https://www.strava.com/oauth/authorize?${params.toString()}`;
}

export function stravaRedirectUri(origin: string) {
  return `${origin}/api/v1/integrations/strava/callback`;
}
