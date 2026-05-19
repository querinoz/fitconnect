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
 * Allowlist mirroring https://developers.strava.com/playground/
 * (read endpoints + optional write/upload when scopes permit).
 */
export const STRAVA_API_ENDPOINTS: StravaEndpointRule[] = [
  { pattern: /^\/athlete$/, methods: ["GET", "PUT"], scopeNote: "PUT requires profile:write" },
  { pattern: /^\/athlete\/zones$/, methods: ["GET"] },
  { pattern: /^\/athlete\/clubs$/, methods: ["GET"] },
  { pattern: /^\/athlete\/activities$/, methods: ["GET"] },
  { pattern: /^\/athletes\/\d+\/stats$/, methods: ["GET"] },
  { pattern: /^\/athletes\/\d+\/routes$/, methods: ["GET"] },
  { pattern: /^\/activities$/, methods: ["GET", "POST"], scopeNote: "POST requires activity:write" },
  { pattern: /^\/activities\/\d+$/, methods: ["GET", "PUT"], scopeNote: "PUT requires activity:write" },
  { pattern: /^\/activities\/\d+\/comments$/, methods: ["GET"] },
  { pattern: /^\/activities\/\d+\/kudos$/, methods: ["GET"] },
  { pattern: /^\/activities\/\d+\/laps$/, methods: ["GET"] },
  { pattern: /^\/activities\/\d+\/zones$/, methods: ["GET"] },
  { pattern: /^\/activities\/\d+\/streams$/, methods: ["GET"] },
  { pattern: /^\/clubs\/\d+$/, methods: ["GET"] },
  { pattern: /^\/clubs\/\d+\/activities$/, methods: ["GET"] },
  { pattern: /^\/clubs\/\d+\/members$/, methods: ["GET"] },
  { pattern: /^\/clubs\/\d+\/admins$/, methods: ["GET"] },
  { pattern: /^\/gear\/[^/]+$/, methods: ["GET"] },
  { pattern: /^\/routes\/\d+$/, methods: ["GET"] },
  { pattern: /^\/routes\/\d+\/streams$/, methods: ["GET"] },
  { pattern: /^\/routes\/\d+\/export_gpx$/, methods: ["GET"], textResponse: true },
  { pattern: /^\/routes\/\d+\/export_tcx$/, methods: ["GET"], textResponse: true },
  { pattern: /^\/segments\/explore$/, methods: ["GET"] },
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
  const normalized = path.startsWith("/") ? path : `/${path}`;
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
