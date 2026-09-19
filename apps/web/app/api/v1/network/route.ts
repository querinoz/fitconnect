import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import {
  listPublicSpots,
  createSpot,
  getVisibleSpot,
  createEvent,
  joinEvent
} from "@/lib/social/sports-network";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  const url = new URL(request.url);
  const view = url.searchParams.get("view") ?? "spots";
  const sport = url.searchParams.get("sport") ?? undefined;

  if (view === "spot") {
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });
    const { spot, redacted } = getVisibleSpot(id, auth.user.id);
    return NextResponse.json({ spot, redacted });
  }

  return NextResponse.json({
    spots: listPublicSpots(sport),
    note: "Public spots never expose exact coordinates."
  });
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
  const action = typeof b.action === "string" ? b.action : "create_spot";

  if (action === "create_spot") {
    if (b.confirm !== true) {
      return NextResponse.json({ error: "confirmation_required" }, { status: 400 });
    }
    const visibility = (b.visibility as "public" | "secret" | "private" | "followers") ?? "public";
    const spot = createSpot({
      spotId: typeof b.spotId === "string" ? b.spotId : `spot_${Date.now().toString(36)}`,
      name: typeof b.name === "string" ? b.name : "Untitled spot",
      sport: typeof b.sport === "string" ? b.sport : "RUNNING",
      visibility,
      ownerId: auth.user.id,
      approxLat: typeof b.approxLat === "number" ? b.approxLat : null,
      approxLng: typeof b.approxLng === "number" ? b.approxLng : null,
      exactLat: typeof b.exactLat === "number" ? b.exactLat : null,
      exactLng: typeof b.exactLng === "number" ? b.exactLng : null,
      difficulty: typeof b.difficulty === "string" ? b.difficulty : null,
      surface: typeof b.surface === "string" ? b.surface : null,
      hazards: Array.isArray(b.hazards) ? (b.hazards as string[]) : [],
      bestTime: typeof b.bestTime === "string" ? b.bestTime : null,
      sharedWith: Array.isArray(b.sharedWith) ? (b.sharedWith as string[]) : [],
      dangerFlag: Boolean(b.dangerFlag)
    });
    return NextResponse.json({ spot }, { status: 201 });
  }

  if (action === "create_event") {
    if (b.confirm !== true) {
      return NextResponse.json({ error: "confirmation_required" }, { status: 400 });
    }
    const event = createEvent({
      eventId: typeof b.eventId === "string" ? b.eventId : `evt_${Date.now().toString(36)}`,
      sport: typeof b.sport === "string" ? b.sport : "RUNNING",
      title: typeof b.title === "string" ? b.title : "Event",
      startsAt: typeof b.startsAt === "string" ? b.startsAt : new Date().toISOString(),
      locationLabel: typeof b.locationLabel === "string" ? b.locationLabel : null,
      visibility: (b.visibility as "public" | "private") ?? "public",
      participantIds: [auth.user.id],
      ownerId: auth.user.id
    });
    return NextResponse.json({ event }, { status: 201 });
  }

  if (action === "join_event") {
    const eventId = typeof b.eventId === "string" ? b.eventId : "";
    const result = joinEvent(eventId, auth.user.id);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.reason === "forbidden" ? "forbidden" : "event_not_found" },
        { status: result.reason === "forbidden" ? 403 : 404 }
      );
    }
    return NextResponse.json({ event: result.event });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
