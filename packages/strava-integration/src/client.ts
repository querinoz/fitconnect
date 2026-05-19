import type {
  StravaDetailedActivity,
  StravaRateLimit,
  StravaStream,
  StravaStreamType,
  StravaSummaryActivity,
  StravaWebhookEvent
} from "@fitconnect/types";
import { STRAVA_API_BASE, STRAVA_TOKEN_URL } from "./oauth";
import {
  parseRateLimitHeaders,
  StravaRateLimitError,
  withRetry
} from "./rate-limit";
import {
  stravaAthleteSchema,
  stravaDetailedActivitySchema,
  stravaStreamSchema,
  stravaSummaryActivitySchema,
  stravaTokenResponseSchema,
  stravaWebhookEventSchema,
  type StravaTokenResponseInput
} from "./schemas";

export type StravaClientConfig = {
  clientId: string;
  clientSecret: string;
  getAccessToken: () => Promise<string | null>;
  refreshToken: () => Promise<StravaTokenResponseInput | null>;
  onRateLimit?: (limits: StravaRateLimit) => void;
};

export type ListActivitiesParams = {
  page?: number;
  perPage?: number;
  before?: number;
  after?: number;
};

export type ActivityStreamsParams = {
  keys?: StravaStreamType[];
  keyByType?: boolean;
  resolution?: "low" | "medium" | "high";
};

const DEFAULT_STREAM_KEYS: StravaStreamType[] = [
  "time",
  "distance",
  "latlng",
  "altitude",
  "velocity_smooth",
  "heartrate",
  "cadence",
  "watts",
  "grade_smooth"
];

export class StravaClient {
  private lastRateLimit: StravaRateLimit | null = null;

  constructor(private config: StravaClientConfig) {}

  get rateLimits(): StravaRateLimit | null {
    return this.lastRateLimit;
  }

  private async request<T>(
    path: string,
    init?: RequestInit & { retry?: boolean }
  ): Promise<T> {
    const exec = async () => {
      const token = await this.config.getAccessToken();
      if (!token) throw new Error("Strava not connected");

      const res = await fetch(`${STRAVA_API_BASE}${path}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...init?.headers
        }
      });

      this.lastRateLimit = parseRateLimitHeaders(res.headers);
      this.config.onRateLimit?.(this.lastRateLimit);

      if (res.status === 401) {
        const refreshed = await this.config.refreshToken();
        if (refreshed) {
          const retryRes = await fetch(`${STRAVA_API_BASE}${path}`, {
            ...init,
            headers: {
              Authorization: `Bearer ${refreshed.access_token}`,
              "Content-Type": "application/json",
              ...init?.headers
            }
          });
          this.lastRateLimit = parseRateLimitHeaders(retryRes.headers);
          if (!retryRes.ok) throw await this.errorFromResponse(retryRes);
          return retryRes.json() as Promise<T>;
        }
      }

      if (res.status === 429) {
        const retryAfter = Number(res.headers.get("Retry-After") ?? "15") * 1000;
        throw new StravaRateLimitError(
          "Strava rate limit exceeded",
          retryAfter,
          this.lastRateLimit!
        );
      }

      if (!res.ok) throw await this.errorFromResponse(res);
      return res.json() as Promise<T>;
    };

    return init?.retry === false ? exec() : withRetry(exec);
  }

  private async errorFromResponse(res: Response): Promise<Error> {
    const body = await res.text().catch(() => "");
    return new Error(`Strava API ${res.status}: ${body.slice(0, 200)}`);
  }

  /** Exchange authorization code for tokens. */
  static async exchangeCode(
    clientId: string,
    clientSecret: string,
    code: string,
    redirectUri: string
  ): Promise<StravaTokenResponseInput | null> {
    const res = await fetch(STRAVA_TOKEN_URL, {
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
    const json = await res.json();
    return stravaTokenResponseSchema.parse(json);
  }

  /** Refresh access token. */
  static async refreshAccessToken(
    clientId: string,
    clientSecret: string,
    refreshToken: string
  ): Promise<StravaTokenResponseInput | null> {
    const res = await fetch(STRAVA_TOKEN_URL, {
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
    return stravaTokenResponseSchema.parse(await res.json());
  }

  async getAthlete() {
    const data = await this.request<unknown>("/athlete");
    return stravaAthleteSchema.parse(data);
  }

  async getAthleteStats(athleteId: number) {
    return this.request<Record<string, unknown>>(`/athletes/${athleteId}/stats`);
  }

  async getAthleteZones() {
    return this.request<Record<string, unknown>>("/athlete/zones");
  }

  async listActivities(params: ListActivitiesParams = {}): Promise<StravaSummaryActivity[]> {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    qs.set("per_page", String(params.perPage ?? 30));
    if (params.before) qs.set("before", String(params.before));
    if (params.after) qs.set("after", String(params.after));

    const data = await this.request<unknown[]>(`/athlete/activities?${qs}`);
    return data.map((row) => stravaSummaryActivitySchema.parse(row)) as StravaSummaryActivity[];
  }

  async getActivity(id: number, includeAllEfforts = false): Promise<StravaDetailedActivity> {
    const qs = includeAllEfforts ? "?include_all_efforts=true" : "";
    const data = await this.request<unknown>(`/activities/${id}${qs}`);
    return stravaDetailedActivitySchema.parse(data) as StravaDetailedActivity;
  }

  async createActivity(input: {
    name: string;
    sport_type: string;
    start_date_local: string;
    elapsed_time: number;
    description?: string;
    distance?: number;
    trainer?: boolean;
    commute?: boolean;
  }) {
    const body = new URLSearchParams();
    Object.entries(input).forEach(([k, v]) => {
      if (v !== undefined) body.set(k, String(v));
    });
    return this.request<StravaDetailedActivity>("/activities", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString()
    });
  }

  async updateActivity(
    id: number,
    input: Partial<{
      name: string;
      description: string;
      sport_type: string;
      trainer: boolean;
      commute: boolean;
    }>
  ) {
    const body = new URLSearchParams();
    Object.entries(input).forEach(([k, v]) => {
      if (v !== undefined) body.set(k, String(v));
    });
    return this.request<StravaDetailedActivity>(`/activities/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString()
    });
  }

  async getActivityStreams(
    activityId: number,
    params: ActivityStreamsParams = {}
  ): Promise<StravaStream[]> {
    const keys = (params.keys ?? DEFAULT_STREAM_KEYS).join(",");
    const qs = new URLSearchParams({
      keys,
      key_by_type: String(params.keyByType ?? true),
      resolution: params.resolution ?? "medium"
    });
    const data = await this.request<unknown>(`/activities/${activityId}/streams?${qs}`);

    if (Array.isArray(data)) {
      return data.map((s) => stravaStreamSchema.parse(s)) as StravaStream[];
    }

    // key_by_type=true returns object map
    return Object.values(data as Record<string, unknown>).map(
      (s) => stravaStreamSchema.parse(s)
    ) as StravaStream[];
  }

  async getActivityLaps(activityId: number) {
    return this.request<unknown[]>(`/activities/${activityId}/laps`);
  }

  async getSegmentEffort(id: number) {
    return this.request<Record<string, unknown>>(`/segment_efforts/${id}`);
  }

  async getSegment(id: number) {
    return this.request<Record<string, unknown>>(`/segments/${id}`);
  }

  async getActivityComments(
    activityId: number,
    params: { pageSize?: number; afterCursor?: string } = {}
  ) {
    const qs = new URLSearchParams();
    if (params.pageSize) qs.set("page_size", String(params.pageSize));
    if (params.afterCursor) qs.set("after_cursor", params.afterCursor);
    const suffix = qs.size ? `?${qs}` : "";
    return this.request<unknown[]>(`/activities/${activityId}/comments${suffix}`);
  }

  async getActivityKudos(
    activityId: number,
    params: { page?: number; perPage?: number } = {}
  ) {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    qs.set("per_page", String(params.perPage ?? 30));
    return this.request<unknown[]>(`/activities/${activityId}/kudos?${qs}`);
  }

  async getActivityZones(activityId: number) {
    return this.request<unknown[]>(`/activities/${activityId}/zones`);
  }

  async listAthleteClubs() {
    return this.request<unknown[]>("/athlete/clubs");
  }

  async listAthleteRoutes(athleteId: number, page = 1, perPage = 30) {
    const qs = new URLSearchParams({
      page: String(page),
      per_page: String(perPage)
    });
    return this.request<unknown[]>(`/athletes/${athleteId}/routes?${qs}`);
  }

  async getRoute(routeId: number) {
    return this.request<Record<string, unknown>>(`/routes/${routeId}`);
  }

  async getRouteStreams(
    routeId: number,
    params: ActivityStreamsParams = {}
  ): Promise<StravaStream[]> {
    const keys = (params.keys ?? DEFAULT_STREAM_KEYS).join(",");
    const qs = new URLSearchParams({
      keys,
      key_by_type: String(params.keyByType ?? true),
      resolution: params.resolution ?? "medium"
    });
    const data = await this.request<unknown>(`/routes/${routeId}/streams?${qs}`);
    if (Array.isArray(data)) {
      return data.map((s) => stravaStreamSchema.parse(s)) as StravaStream[];
    }
    return Object.values(data as Record<string, unknown>).map(
      (s) => stravaStreamSchema.parse(s)
    ) as StravaStream[];
  }

  async exportRouteGpx(routeId: number) {
    return this.requestText(`/routes/${routeId}/export_gpx`);
  }

  async exportRouteTcx(routeId: number) {
    return this.requestText(`/routes/${routeId}/export_tcx`);
  }

  async getGear(gearId: string) {
    return this.request<Record<string, unknown>>(`/gear/${gearId}`);
  }

  async exploreSegments(params: {
    bounds: [number, number, number, number];
    activityType?: "running" | "riding";
    minCat?: number;
    maxCat?: number;
  }) {
    const qs = new URLSearchParams({ bounds: params.bounds.join(",") });
    if (params.activityType) qs.set("activity_type", params.activityType);
    if (params.minCat !== undefined) qs.set("min_cat", String(params.minCat));
    if (params.maxCat !== undefined) qs.set("max_cat", String(params.maxCat));
    return this.request<Record<string, unknown>>(`/segments/explore?${qs}`);
  }

  async listStarredSegments(page = 1, perPage = 30) {
    const qs = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    return this.request<unknown[]>(`/segments/starred?${qs}`);
  }

  async setSegmentStarred(segmentId: number, starred: boolean) {
    if (starred) {
      return this.request<Record<string, unknown>>(`/segments/${segmentId}/starred`, {
        method: "PUT"
      });
    }
    return this.request<void>(`/segments/${segmentId}/starred`, {
      method: "DELETE",
      retry: false
    });
  }

  async getSegmentStreams(
    segmentId: number,
    params: ActivityStreamsParams = {}
  ): Promise<StravaStream[]> {
    const keys = (params.keys ?? DEFAULT_STREAM_KEYS).join(",");
    const qs = new URLSearchParams({
      keys,
      key_by_type: String(params.keyByType ?? true)
    });
    const data = await this.request<unknown>(`/segments/${segmentId}/streams?${qs}`);
    if (Array.isArray(data)) {
      return data.map((s) => stravaStreamSchema.parse(s)) as StravaStream[];
    }
    return Object.values(data as Record<string, unknown>).map(
      (s) => stravaStreamSchema.parse(s)
    ) as StravaStream[];
  }

  async listSegmentEfforts(params: {
    segmentId: number;
    startDateLocal?: string;
    endDateLocal?: string;
    perPage?: number;
  }) {
    const qs = new URLSearchParams({ segment_id: String(params.segmentId) });
    if (params.startDateLocal) qs.set("start_date_local", params.startDateLocal);
    if (params.endDateLocal) qs.set("end_date_local", params.endDateLocal);
    qs.set("per_page", String(params.perPage ?? 30));
    return this.request<unknown[]>(`/segment_efforts?${qs}`);
  }

  async getSegmentEffortStreams(
    effortId: number,
    params: ActivityStreamsParams = {}
  ): Promise<StravaStream[]> {
    const keys = (params.keys ?? DEFAULT_STREAM_KEYS).join(",");
    const qs = new URLSearchParams({
      keys,
      key_by_type: String(params.keyByType ?? true)
    });
    const data = await this.request<unknown>(`/segment_efforts/${effortId}/streams?${qs}`);
    if (Array.isArray(data)) {
      return data.map((s) => stravaStreamSchema.parse(s)) as StravaStream[];
    }
    return Object.values(data as Record<string, unknown>).map(
      (s) => stravaStreamSchema.parse(s)
    ) as StravaStream[];
  }

  async getClub(clubId: number) {
    return this.request<Record<string, unknown>>(`/clubs/${clubId}`);
  }

  async listClubActivities(clubId: number, page = 1, perPage = 30) {
    const qs = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    return this.request<unknown[]>(`/clubs/${clubId}/activities?${qs}`);
  }

  async listClubMembers(clubId: number, page = 1, perPage = 30) {
    const qs = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    return this.request<unknown[]>(`/clubs/${clubId}/members?${qs}`);
  }

  async listClubAdmins(clubId: number, page = 1, perPage = 30) {
    const qs = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    return this.request<unknown[]>(`/clubs/${clubId}/admins?${qs}`);
  }

  async updateAthlete(input: { weight: number }) {
    const body = new URLSearchParams({ weight: String(input.weight) });
    return this.request<Record<string, unknown>>("/athlete", {
      method: "PUT",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString()
    });
  }

  async createUpload(input: {
    file: Blob;
    name?: string;
    description?: string;
    trainer?: boolean;
    commute?: boolean;
    dataType?: "fit" | "fit.gz" | "tcx" | "tcx.gz" | "gpx" | "gpx.gz";
    externalId?: string;
  }) {
    const form = new FormData();
    form.append("file", input.file);
    if (input.name) form.append("name", input.name);
    if (input.description) form.append("description", input.description);
    if (input.trainer !== undefined) form.append("trainer", String(input.trainer));
    if (input.commute !== undefined) form.append("commute", String(input.commute));
    if (input.dataType) form.append("data_type", input.dataType);
    if (input.externalId) form.append("external_id", input.externalId);
    return this.requestForm<Record<string, unknown>>("/uploads", form, "POST");
  }

  async getUploadStatus(uploadId: number) {
    return this.request<Record<string, unknown>>(`/uploads/${uploadId}`);
  }

  /**
   * Proxy an allowlisted Strava API v3 path (used by FitConnect REST gateway).
   */
  async proxyRequest(
    method: string,
    path: string,
    init?: { body?: BodyInit; contentType?: string; textResponse?: boolean }
  ): Promise<{ status: number; data: unknown }> {
    const token = await this.config.getAccessToken();
    if (!token) throw new Error("Strava not connected");

    const exec = async (accessToken: string) => {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`
      };
      if (init?.contentType) headers["Content-Type"] = init.contentType;

      const res = await fetch(`${STRAVA_API_BASE}${path}`, {
        method,
        headers,
        body: init?.body
      });

      this.lastRateLimit = parseRateLimitHeaders(res.headers);
      this.config.onRateLimit?.(this.lastRateLimit);

      if (res.status === 401) return { unauthorized: true as const, res };
      if (res.status === 429) {
        const retryAfter = Number(res.headers.get("Retry-After") ?? "15") * 1000;
        throw new StravaRateLimitError(
          "Strava rate limit exceeded",
          retryAfter,
          this.lastRateLimit!
        );
      }

      if (!res.ok) throw await this.errorFromResponse(res);

      if (init?.textResponse) {
        return { unauthorized: false as const, res, data: await res.text() };
      }

      const text = await res.text();
      if (!text) return { unauthorized: false as const, res, data: null };
      try {
        return { unauthorized: false as const, res, data: JSON.parse(text) };
      } catch {
        return { unauthorized: false as const, res, data: text };
      }
    };

    let result = await exec(token);
    if ("unauthorized" in result && result.unauthorized) {
      const refreshed = await this.config.refreshToken();
      if (!refreshed) throw new Error("Strava token refresh failed");
      result = await exec(refreshed.access_token);
      if ("unauthorized" in result && result.unauthorized) {
        throw new Error("Strava not connected");
      }
    }

    return { status: 200, data: result.data };
  }

  private async requestText(path: string): Promise<string> {
    const token = await this.config.getAccessToken();
    if (!token) throw new Error("Strava not connected");

    const exec = async (accessToken: string) => {
      const res = await fetch(`${STRAVA_API_BASE}${path}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      this.lastRateLimit = parseRateLimitHeaders(res.headers);
      this.config.onRateLimit?.(this.lastRateLimit);
      if (res.status === 401) return { unauthorized: true as const, res };
      if (!res.ok) throw await this.errorFromResponse(res);
      return { unauthorized: false as const, res, text: await res.text() };
    };

    let result = await exec(token);
    if (result.unauthorized) {
      const refreshed = await this.config.refreshToken();
      if (!refreshed) throw new Error("Strava token refresh failed");
      result = await exec(refreshed.access_token);
      if (result.unauthorized) throw new Error("Strava not connected");
    }
    return result.text;
  }

  private async requestForm<T>(
    path: string,
    form: FormData,
    method: "POST" | "PUT" = "POST"
  ): Promise<T> {
    const token = await this.config.getAccessToken();
    if (!token) throw new Error("Strava not connected");

    const exec = async (accessToken: string) => {
      const res = await fetch(`${STRAVA_API_BASE}${path}`, {
        method,
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form
      });
      this.lastRateLimit = parseRateLimitHeaders(res.headers);
      this.config.onRateLimit?.(this.lastRateLimit);
      if (res.status === 401) return { unauthorized: true as const, res };
      if (!res.ok) throw await this.errorFromResponse(res);
      return { unauthorized: false as const, res, data: (await res.json()) as T };
    };

    let result = await exec(token);
    if (result.unauthorized) {
      const refreshed = await this.config.refreshToken();
      if (!refreshed) throw new Error("Strava token refresh failed");
      result = await exec(refreshed.access_token);
      if (result.unauthorized) throw new Error("Strava not connected");
    }
    return result.data;
  }

  /** Paginate all activities since timestamp (unix seconds). */
  async listAllActivitiesSince(afterUnix: number, maxPages = 10): Promise<StravaSummaryActivity[]> {
    const all: StravaSummaryActivity[] = [];
    for (let page = 1; page <= maxPages; page++) {
      const batch = await this.listActivities({ page, perPage: 50, after: afterUnix });
      all.push(...batch);
      if (batch.length < 50) break;
    }
    return all;
  }
}

/** Parse incoming webhook POST body. */
export function parseWebhookEvent(body: unknown): StravaWebhookEvent | null {
  const parsed = stravaWebhookEventSchema.safeParse(body);
  return parsed.success ? (parsed.data as StravaWebhookEvent) : null;
}

/** Verify Strava webhook subscription challenge. */
export function verifyWebhookChallenge(params: {
  mode: string | null;
  token: string | null;
  challenge: string | null;
  verifyToken: string;
}): { ok: true; challenge: string } | { ok: false } {
  if (
    params.mode === "subscribe" &&
    params.token === params.verifyToken &&
    params.challenge
  ) {
    return { ok: true, challenge: params.challenge };
  }
  return { ok: false };
}

/** Register push subscription (run once per environment). */
export async function createPushSubscription(input: {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  verifyToken: string;
}) {
  const body = new URLSearchParams({
    client_id: input.clientId,
    client_secret: input.clientSecret,
    callback_url: input.callbackUrl,
    verify_token: input.verifyToken
  });
  const res = await fetch(`${STRAVA_API_BASE}/push_subscriptions`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });
  if (!res.ok) throw new Error(`Failed to create push subscription: ${res.status}`);
  return res.json() as Promise<{ id: number }>;
}

export async function listPushSubscriptions(clientId: string, clientSecret: string) {
  const qs = new URLSearchParams({ client_id: clientId, client_secret: clientSecret });
  const res = await fetch(`${STRAVA_API_BASE}/push_subscriptions?${qs}`);
  if (!res.ok) return [];
  return res.json() as Promise<Array<{ id: number; callback_url: string }>>;
}

export async function deletePushSubscription(
  id: number,
  clientId: string,
  clientSecret: string
) {
  const qs = new URLSearchParams({ client_id: clientId, client_secret: clientSecret });
  await fetch(`${STRAVA_API_BASE}/push_subscriptions/${id}?${qs}`, { method: "DELETE" });
}

/** Revoke access — POST https://www.strava.com/oauth/deauthorize */
export async function deauthorizeAthlete(accessToken: string): Promise<boolean> {
  const res = await fetch(`${STRAVA_TOKEN_URL.replace("/token", "/deauthorize")}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return res.ok;
}
