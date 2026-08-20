import { NextResponse } from "next/server";
import {
  isStravaAthleteRevocation,
  parseWebhookEvent,
  verifyWebhookChallenge
} from "@fitconnect/strava-integration";
import { getConnectionByStravaAthleteId } from "@/lib/integrations/strava/service";
import { isDemoMode } from "@/lib/integrations/strava/route-auth";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import {
  canEnqueueStravaSyncJob,
  integrationJobSecret,
  qstashPublishToken,
  stravaWebhookVerifyToken
} from "@/lib/integrations/strava/webhook-secrets";

async function enqueueStravaJob(payload: {
  athleteExternalId: string;
  activityId?: number;
  aspectType: "create" | "update" | "delete";
}): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const origin = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

  const jobUrl = `${origin}/api/v1/jobs/strava-sync`;
  const body = JSON.stringify(payload);
  const enqueue = canEnqueueStravaSyncJob();
  if (!enqueue.ok) {
    return { ok: false, error: enqueue.error, status: 503 };
  }

  if (enqueue.mode === "qstash") {
    const qstashToken = qstashPublishToken();
    if (!qstashToken) {
      return { ok: false, error: "qstash_required", status: 503 };
    }
    const forwardSecret = integrationJobSecret();
    if (!forwardSecret) {
      return { ok: false, error: "job_secret_required", status: 503 };
    }
    await fetch(`https://qstash.upstash.io/v2/publish/${jobUrl}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${qstashToken}`,
        "Content-Type": "application/json",
        "Upstash-Forward-Authorization": `Bearer ${forwardSecret}`
      },
      body
    }).catch(() => undefined);
    return { ok: true };
  }

  const jobSecret = integrationJobSecret();
  if (!jobSecret) {
    return { ok: false, error: "job_secret_required", status: 503 };
  }
  await fetch(jobUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jobSecret}`
    },
    body
  }).catch(() => undefined);
  return { ok: true };
}

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "webhook");
  if (limited) return limited;

  const verifyToken = stravaWebhookVerifyToken();
  if (!verifyToken) {
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const result = verifyWebhookChallenge({
    mode: searchParams.get("hub.mode"),
    token: searchParams.get("hub.verify_token"),
    challenge: searchParams.get("hub.challenge"),
    verifyToken
  });

  if (result.ok) {
    return NextResponse.json({ "hub.challenge": result.challenge });
  }
  return NextResponse.json({ error: "forbidden" }, { status: 403 });
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "webhook");
  if (limited) return limited;

  const verifyToken = stravaWebhookVerifyToken();
  if (!verifyToken) {
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 503 });
  }

  if (isDemoMode()) {
    return new Response("EVENT_RECEIVED", { status: 200 });
  }

  const body = await request.json().catch(() => null);
  const event = parseWebhookEvent(body);
  if (!event) {
    return NextResponse.json({ error: "invalid_event" }, { status: 400 });
  }

  if (event.object_type === "athlete" && isStravaAthleteRevocation(event)) {
    const { markDeauthorized } = await import("@/lib/integrations/strava/service");
    await markDeauthorized(event.owner_id);
    return new Response("EVENT_RECEIVED", { status: 200 });
  }

  if (event.object_type !== "activity") {
    return new Response("EVENT_RECEIVED", { status: 200 });
  }

  const conn = await getConnectionByStravaAthleteId(event.owner_id);
  if (!conn || conn.deauthorizedAt) {
    return new Response("EVENT_RECEIVED", { status: 200 });
  }

  const queued = await enqueueStravaJob({
    athleteExternalId: conn.athleteExternalId,
    activityId: event.object_id,
    aspectType: event.aspect_type
  });
  if (!queued.ok) {
    return NextResponse.json({ error: queued.error }, { status: queued.status });
  }

  return new Response("EVENT_RECEIVED", { status: 200 });
}
