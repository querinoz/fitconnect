import { NextResponse } from "next/server";
import { isAuthFailure, requireAthleteId, requireAuth } from "@/lib/api/require-auth";
import { createAthleteBooking, listAthleteBookings } from "@/lib/db/bookings";
import { publishSessionBooking } from "@/lib/realtime/publish-booking";

/**
 * Athlete list-own-bookings — auth subject only; demo mode forbidden (Path A).
 */
export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  if (auth.demo) {
    return NextResponse.json({ error: "demo_forbidden" }, { status: 403 });
  }

  const resolved = await requireAthleteId(req);
  if (isAuthFailure(resolved)) return resolved.response;

  const { bookings, source } = await listAthleteBookings(resolved.athleteId);
  return NextResponse.json({ bookings, source });
}

/**
 * Athlete create-booking — canonical Session row (pending).
 * Identity always from auth subject; client cannot impersonate another athleteId.
 */
export async function POST(req: Request) {
  const resolved = await requireAthleteId(req);
  if (isAuthFailure(resolved)) return resolved.response;

  const body = (await req.json().catch(() => null)) as {
    coachId?: string;
    scheduledAt?: string;
    durationMin?: number;
    type?: string;
    mode?: "Online" | "In-person";
    notes?: string | null;
    athleteId?: string;
    idempotencyKey?: string;
  } | null;

  if (body?.athleteId && body.athleteId !== resolved.athleteId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (!body?.coachId?.trim() || !body?.scheduledAt?.trim()) {
    return NextResponse.json(
      { error: "coachId_and_scheduledAt_required" },
      { status: 400 }
    );
  }

  const idempotencyKey =
    body.idempotencyKey?.trim() ||
    req.headers.get("idempotency-key")?.trim() ||
    null;

  const result = await createAthleteBooking({
    athleteId: resolved.athleteId,
    coachId: body.coachId,
    scheduledAt: body.scheduledAt,
    durationMin: body.durationMin,
    type: body.type,
    mode: body.mode,
    notes: body.notes,
    idempotencyKey
  });

  if (result.error === "persistence_not_configured") {
    return NextResponse.json({ error: result.error }, { status: 503 });
  }
  if (result.error === "coachId_required" || result.error === "invalid_scheduledAt") {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  if (result.error === "scheduledAt_in_past") {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }
  if (result.error || !result.booking) {
    return NextResponse.json(
      { error: result.error ?? "create_failed" },
      { status: 500 }
    );
  }

  if (!result.idempotent) {
    publishSessionBooking({
      id: result.booking.id,
      athleteId: result.booking.athleteId,
      athleteName: "Athlete",
      coachId: result.booking.coachId,
      coachName: "Coach",
      mode: "standard"
    });
  }

  return NextResponse.json(
    {
      booking: result.booking,
      source: result.source,
      idempotent: result.idempotent
    },
    { status: result.idempotent ? 200 : 201 }
  );
}
