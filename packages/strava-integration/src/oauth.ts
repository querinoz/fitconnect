export const STRAVA_OAUTH_URL = "https://www.strava.com/oauth/authorize";
export const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
export const STRAVA_API_BASE = "https://www.strava.com/api/v3";

/** Minimum scopes for FitConnect coaching (private activities + streams). */
export const STRAVA_DEFAULT_SCOPES = [
  "read",
  "activity:read",
  "activity:read_all",
  "profile:read_all"
] as const;

export type StravaOAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export function buildStravaAuthorizeUrl(
  config: StravaOAuthConfig,
  state: string,
  scopes: readonly string[] = STRAVA_DEFAULT_SCOPES
): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    approval_prompt: "auto",
    scope: scopes.join(","),
    state
  });
  return `${STRAVA_OAUTH_URL}?${params.toString()}`;
}

export function buildStravaCallbackUri(origin: string): string {
  return `${origin.replace(/\/$/, "")}/api/v1/integrations/strava/callback`;
}
