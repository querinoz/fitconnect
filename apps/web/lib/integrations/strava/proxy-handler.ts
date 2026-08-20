import { NextResponse } from "next/server";
import { matchStravaEndpoint, StravaRateLimitError, isBannedStravaPath } from "@fitconnect/strava-integration";
import {
  createStravaClientForAthlete,
  getConnectionByAthlete
} from "@/lib/integrations/strava/service";
import { resolveIntegrationAthlete } from "@/lib/integrations/strava/route-auth";
import { getStravaRateLimit } from "@/lib/integrations/strava/rate-limit-cache";
import { enforceRateLimit } from "@/lib/security/rate-limit";

function buildStravaPath(segments: string[], search: string): string {
  const path = `/${segments.join("/")}`;
  return search ? `${path}?${search}` : path;
}

export async function handleStravaV3Proxy(
  request: Request,
  pathSegments: string[]
): Promise<NextResponse> {
  const url = new URL(request.url);
  const limited = await enforceRateLimit(request, "strava");
  if (limited) return limited;

  const auth = await resolveIntegrationAthlete(request, url.searchParams.get("athleteId"));
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const conn = await getConnectionByAthlete(auth.athleteId);
  if (!conn || conn.deauthorizedAt) {
    return NextResponse.json({ error: "not_connected" }, { status: 404 });
  }

  const stravaPathOnly = `/${pathSegments.join("/")}`;
  if (isBannedStravaPath(stravaPathOnly)) {
    return NextResponse.json(
      { error: "endpoint_forbidden", path: stravaPathOnly },
      { status: 403 }
    );
  }
  const rule = matchStravaEndpoint(stravaPathOnly, request.method);
  if (!rule) {
    return NextResponse.json(
      { error: "endpoint_not_allowed", path: stravaPathOnly, method: request.method },
      { status: 404 }
    );
  }

  const client = createStravaClientForAthlete(auth.athleteId);
  if (!client) {
    return NextResponse.json({ error: "strava_not_configured" }, { status: 503 });
  }

  const stravaPath = buildStravaPath(pathSegments, url.search);
  const contentType = request.headers.get("content-type") ?? undefined;
  let body: BodyInit | undefined;

  if (request.method !== "GET" && request.method !== "HEAD") {
    if (contentType?.includes("multipart/form-data")) {
      body = await request.arrayBuffer();
    } else if (contentType?.includes("application/json")) {
      body = await request.text();
    } else {
      body = await request.text();
    }
  }

  try {
    const { data } = await client.proxyRequest(request.method, stravaPath, {
      body,
      contentType,
      textResponse: rule.textResponse
    });

    const rateLimit = getStravaRateLimit();
    if (rule.textResponse && typeof data === "string") {
      const ext = stravaPathOnly.endsWith("gpx") ? "gpx" : "tcx";
      return new NextResponse(data, {
        status: 200,
        headers: {
          "Content-Type": ext === "gpx" ? "application/gpx+xml" : "application/vnd.garmin.tcx+xml",
          "X-Strava-RateLimit": JSON.stringify(rateLimit)
        }
      });
    }

    return NextResponse.json(
      {
        ok: true,
        data,
        rateLimit,
        subscriptionRequired: rule.subscription ?? false
      },
      { status: 200 }
    );
  } catch (e) {
    if (e instanceof StravaRateLimitError) {
      return NextResponse.json(
        { error: "rate_limited", retryAfterMs: e.retryAfterMs },
        { status: 429 }
      );
    }
    const message = e instanceof Error ? e.message : String(e);
    const status = message.includes("403") ? 403 : message.includes("404") ? 404 : 502;
    return NextResponse.json({ error: "strava_error", detail: message }, { status });
  }
}
