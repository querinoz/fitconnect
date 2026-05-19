import { NextResponse } from "next/server";
import {
  parseWebhookEvent,
  verifyWebhookChallenge
} from "@fitconnect/strava-integration";
import { getConnectionByStravaAthleteId } from "@/lib/integrations/strava/service";

const VERIFY_TOKEN = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN ?? "fitconnect-dev";

async function enqueueStravaJob(payload: {
  athleteExternalId: string;
  activityId?: number;
  aspectType: "create" | "update" | "delete";
}) {
  const origin = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

  const jobUrl = `${origin}/api/v1/jobs/strava-sync`;
  const body = JSON.stringify(payload);
  const qstashToken = process.env.QSTASH_TOKEN;

  if (qstashToken) {
    await fetch(`https://qstash.upstash.io/v2/publish/${jobUrl}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${qstashToken}`,
        "Content-Type": "application/json"
      },
      body
    }).catch(() => undefined);
    return;
  }

  await fetch(jobUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body
  }).catch(() => undefined);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const result = verifyWebhookChallenge({
    mode: searchParams.get("hub.mode"),
    token: searchParams.get("hub.verify_token"),
    challenge: searchParams.get("hub.challenge"),
    verifyToken: VERIFY_TOKEN
  });

  if (result.ok) {
    return NextResponse.json({ "hub.challenge": result.challenge });
  }
  return NextResponse.json({ error: "forbidden" }, { status: 403 });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const event = parseWebhookEvent(body);
  if (!event) return new Response("EVENT_RECEIVED", { status: 200 });

  if (event.object_type === "athlete" && event.aspect_type === "delete") {
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

  void enqueueStravaJob({
    athleteExternalId: conn.athleteExternalId,
    activityId: event.object_id,
    aspectType: event.aspect_type
  });

  return new Response("EVENT_RECEIVED", { status: 200 });
}
