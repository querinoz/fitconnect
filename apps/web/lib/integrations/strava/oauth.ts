import { buildStravaAuthorizeUrl, buildStravaCallbackUri, STRAVA_DEFAULT_SCOPES } from "@fitconnect/strava-integration";

export { STRAVA_DEFAULT_SCOPES };

export const stravaRedirectUri = buildStravaCallbackUri;
export const getStravaRedirectUri = buildStravaCallbackUri;

export function getStravaAuthUrl(state: string, origin: string) {
  const clientId = process.env.STRAVA_CLIENT_ID;
  if (!clientId) return null;
  return buildStravaAuthorizeUrl(
    { clientId, clientSecret: "", redirectUri: buildStravaCallbackUri(origin) },
    state,
    STRAVA_DEFAULT_SCOPES
  );
}

export const stravaAuthUrl = getStravaAuthUrl;
