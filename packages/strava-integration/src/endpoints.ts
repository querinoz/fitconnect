/** HTTP methods supported per Strava API v3 path pattern. */
export type StravaEndpointRule = {
  pattern: RegExp;
  methods: Array<"GET" | "POST" | "PUT" | "DELETE">;
  /** Response is plain text (GPX/TCX export). */
  textResponse?: boolean;
  /** Requires Strava Summit subscription — may return 403. */
  subscription?: boolean;
  /** Requires extra OAuth scope beyond FitConnect defaults. */
  scopeNote?: string;
};

/**
 * Paths banned by Strava 2026 policy + FitConnect social barrier.
 * Must stay in lockstep with Android `StravaPathAllowlist`.
 */
export const STRAVA_BANNED_PATHS: RegExp[] = [
  /^\/clubs\/[^/]+\/activities$/,
  /^\/clubs\/[^/]+\/admins$/,
  /^\/clubs\/[^/]+\/members$/,
  /^\/segments\/explore$/,
  /^\/activities\/[^/]+\/kudos$/,
  /^\/activities\/[^/]+\/comments$/
];

export class StravaPathDeniedError extends Error {
  readonly path: string;

  constructor(path: string) {
    super(`strava_path_forbidden:${path}`);
    this.name = "StravaPathDeniedError";
    this.path = path;
  }
}

export function normalizeStravaApiPath(path: string): string {
  const withSlash = path.startsWith("/") ? path : `/${path}`;
  const withoutQuery = withSlash.split("?")[0] ?? withSlash;
  const trimmed = withoutQuery.replace(/\/+$/, "");
  return trimmed.length > 0 ? trimmed : "/";
}

export function isBannedStravaPath(path: string): boolean {
  const normalized = normalizeStravaApiPath(path);
  return STRAVA_BANNED_PATHS.some((rule) => rule.test(normalized));
}

export function assertStravaPathAllowed(path: string): void {
  if (isBannedStravaPath(path)) {
    throw new StravaPathDeniedError(normalizeStravaApiPath(path));
  }
}

/**
 * Own-athlete allowlist. Third-party / social Strava endpoints are omitted on purpose.
 */
export const STRAVA_API_ENDPOINTS: StravaEndpointRule[] = [
  { pattern: /^\/athlete$/, methods: ["GET", "PUT"], scopeNote: "PUT requires profile:write" },
  { pattern: /^\/athlete\/zones$/, methods: ["GET"] },
  { pattern: /^\/athlete\/clubs$/, methods: ["GET"] },
  { pattern: /^\/athlete\/activities$/, methods: ["GET"] },
  { pattern: /^\/athletes\/\d+\/stats$/, methods: ["GET"] },
  { pattern: /^\/athletes\/\d+\/routes$/, methods: ["GET"] },
  { pattern: /^\/activities$/, methods: ["GET", "POST"], scopeNote: "POST requires activity:write" },
  { pattern: /^\/activities\/\d+$/, methods: ["GET", "PUT", "DELETE"], scopeNote: "PUT/DELETE require activity:write" },
  { pattern: /^\/activities\/\d+\/laps$/, methods: ["GET"] },
  { pattern: /^\/activities\/\d+\/zones$/, methods: ["GET"] },
  { pattern: /^\/activities\/\d+\/streams$/, methods: ["GET"] },
  { pattern: /^\/clubs\/\d+$/, methods: ["GET"] },
  { pattern: /^\/gear\/[^/]+$/, methods: ["GET"] },
  { pattern: /^\/routes\/\d+$/, methods: ["GET"] },
  { pattern: /^\/routes\/\d+\/streams$/, methods: ["GET"] },
  { pattern: /^\/routes\/\d+\/export_gpx$/, methods: ["GET"], textResponse: true },
  { pattern: /^\/routes\/\d+\/export_tcx$/, methods: ["GET"], textResponse: true },
  { pattern: /^\/segments\/starred$/, methods: ["GET"] },
  { pattern: /^\/segments\/\d+$/, methods: ["GET"] },
  { pattern: /^\/segments\/\d+\/starred$/, methods: ["PUT", "DELETE"] },
  { pattern: /^\/segments\/\d+\/streams$/, methods: ["GET"] },
  {
    pattern: /^\/segment_efforts$/,
    methods: ["GET"],
    subscription: true
  },
  {
    pattern: /^\/segment_efforts\/\d+$/,
    methods: ["GET"],
    subscription: true
  },
  { pattern: /^\/segment_efforts\/\d+\/streams$/, methods: ["GET"] },
  { pattern: /^\/uploads$/, methods: ["POST"], scopeNote: "Requires activity:write" },
  { pattern: /^\/uploads\/\d+$/, methods: ["GET"] }
];

export function matchStravaEndpoint(
  path: string,
  method: string
): StravaEndpointRule | null {
  if (isBannedStravaPath(path)) return null;
  const normalized = normalizeStravaApiPath(path);
  const upper = method.toUpperCase() as StravaEndpointRule["methods"][number];
  for (const rule of STRAVA_API_ENDPOINTS) {
    if (rule.pattern.test(normalized) && rule.methods.includes(upper)) {
      return rule;
    }
  }
  return null;
}

export const STRAVA_ENDPOINT_CATALOG = STRAVA_API_ENDPOINTS.map((rule) => ({
  pattern: rule.pattern.source,
  methods: rule.methods,
  subscription: rule.subscription ?? false,
  scopeNote: rule.scopeNote ?? null
}));
