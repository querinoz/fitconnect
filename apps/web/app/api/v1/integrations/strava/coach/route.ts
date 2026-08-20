import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/security/rate-limit";

/**
 * Strava activities must never be shown to a coach (or any third party).
 * Fail-closed: this route exists only as a tombstone for old clients.
 */
export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "strava");
  if (limited) return limited;

  return NextResponse.json(
    { error: "strava_not_shareable", activities: [] },
    { status: 403 }
  );
}
