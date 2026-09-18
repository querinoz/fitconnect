import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { ingestAthleteEvent, listAthleteEvents } from "@/lib/sports-intelligence/event-store";
import type { AthleteEventSource, AthleteEventType } from "@/lib/sports-intelligence/events";

const ALLOWED: AthleteEventType[] = [
  "WORKOUT_STARTED",
  "WORKOUT_PAUSED",
  "WORKOUT_RESUMED",
  "WORKOUT_COMPLETED",
  "SET_COMPLETED",
  "INTERVAL_COMPLETED",
  "HEART_RATE_UPDATED",
  "HRV_UPDATED",
  "SLEEP_UPDATED",
  "READINESS_UPDATED",
  "RECOVERY_UPDATED",
  "DEVICE_CONNECTED",
  "DEVICE_DISCONNECTED",
  "SYNC_STARTED",
  "SYNC_COMPLETED",
  "SYNC_FAILED",
  "NUTRITION_LOGGED",
  "MEAL_COMPLETED",
  "HYDRATION_LOGGED",
  "SPORT_ACTIVITY_STARTED",
  "SPORT_ACTIVITY_COMPLETED"
];

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  const url = new URL(request.url);
  const since = url.searchParams.get("since") ?? undefined;
  const events = listAthleteEvents(auth.user.id, { since, limit: 100 });
  return NextResponse.json({ events, count: events.length });
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const type = b.type as AthleteEventType;
  if (!ALLOWED.includes(type)) {
    return NextResponse.json({ error: "unknown_event_type" }, { status: 422 });
  }

  const result = ingestAthleteEvent({
    type,
    timestamp: typeof b.timestamp === "string" ? b.timestamp : new Date().toISOString(),
    userId: auth.user.id,
    source: (typeof b.source === "string" ? b.source : "MANUAL") as AthleteEventSource,
    dedupeKey: typeof b.dedupeKey === "string" ? b.dedupeKey : undefined,
    device:
      b.device && typeof b.device === "object"
        ? (b.device as { providerId?: string; deviceLabel?: string })
        : undefined,
    payload: (b.payload && typeof b.payload === "object" ? b.payload : {}) as Record<
      string,
      unknown
    >
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(
    { event: result.event, duplicate: result.duplicate },
    { status: result.duplicate ? 200 : 201 }
  );
}
