import { NextResponse } from "next/server";
import { listAthleteSessions, listCoachSessions } from "@/lib/db/repository";
import { isAuthFailure, requireAthleteId, requireCoachId } from "@/lib/api/require-auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const coachId = searchParams.get("coachId");

  if (coachId) {
    const resolved = await requireCoachId(req, coachId);
    if (isAuthFailure(resolved)) return resolved.response;
    const sessions = await listCoachSessions(resolved.coachId);
    return NextResponse.json({ sessions });
  }

  const resolved = await requireAthleteId(req);
  if (isAuthFailure(resolved)) return resolved.response;
  const sessions = await listAthleteSessions(resolved.athleteId);
  return NextResponse.json({ sessions });
}
