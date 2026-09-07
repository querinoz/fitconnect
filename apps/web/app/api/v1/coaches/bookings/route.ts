import { NextResponse } from "next/server";
import {
  approveCoachBooking,
  listCoachBookings,
  rejectCoachBooking
} from "@/lib/db/repository";
import { isAuthFailure, requireCoachId } from "@/lib/api/require-auth";

export async function GET(req: Request) {
  const resolved = await requireCoachId(req);
  if (isAuthFailure(resolved)) return resolved.response;
  const { bookings, source } = await listCoachBookings(resolved.coachId);
  return NextResponse.json({ bookings, source });
}

export async function POST(req: Request) {
  const resolved = await requireCoachId(req);
  if (isAuthFailure(resolved)) return resolved.response;

  const body = (await req.json().catch(() => null)) as {
    bookingId?: string;
    action?: "approve" | "reject";
  } | null;

  if (!body?.bookingId || (body.action !== "approve" && body.action !== "reject")) {
    return NextResponse.json({ error: "bookingId and action required" }, { status: 400 });
  }

  const result =
    body.action === "approve"
      ? await approveCoachBooking(resolved.coachId, body.bookingId)
      : await rejectCoachBooking(resolved.coachId, body.bookingId);

  if (result.source === "seed") {
    return NextResponse.json(
      { error: "bookings_seed_forbidden_in_remote_path" },
      { status: 503 }
    );
  }

  if (!result.ok) {
    return NextResponse.json({ error: "booking_not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, source: result.source, action: body.action });
}
