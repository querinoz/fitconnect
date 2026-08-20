export {
  StravaClient,
  parseWebhookEvent,
  isStravaAthleteRevocation,
  verifyWebhookChallenge,
  createPushSubscription,
  listPushSubscriptions,
  deletePushSubscription,
  deauthorizeAthlete
} from "./client";

export {
  STRAVA_API_ENDPOINTS,
  STRAVA_BANNED_PATHS,
  STRAVA_ENDPOINT_CATALOG,
  StravaPathDeniedError,
  assertStravaPathAllowed,
  isBannedStravaPath,
  matchStravaEndpoint,
  normalizeStravaApiPath
} from "./endpoints";
export type { StravaEndpointRule } from "./endpoints";
export type { StravaClientConfig, ListActivitiesParams, ActivityStreamsParams } from "./client";

export {
  STRAVA_OAUTH_URL,
  STRAVA_TOKEN_URL,
  STRAVA_API_BASE,
  STRAVA_DEFAULT_SCOPES,
  buildStravaAuthorizeUrl,
  buildStravaCallbackUri
} from "./oauth";
export type { StravaOAuthConfig } from "./oauth";

export {
  decodePolyline,
  encodePolyline,
  buildElevationProfile
} from "./polyline";

export {
  normalizeSummaryActivity,
  normalizeDetailedActivity,
  estimateTrainingLoad,
  formatSyncAgo
} from "./mappers";
export type { NormalizedStravaActivity } from "./mappers";

export {
  indexStreamsByType,
  getHeartRateSeries,
  getAltitudeSeries,
  getDistanceSeries,
  getLatLngSeries,
  getPaceSeries,
  summarizeStreams
} from "./streams";
export type { ParsedStreams } from "./streams";

export {
  parseRateLimitHeaders,
  StravaRateLimitError,
  withRetry,
  isRateLimited
} from "./rate-limit";

export * from "./schemas";
