import { NextResponse } from "next/server";
import { paginate, parsePagination } from "@fitconnect/api-client";
import { listAthleteSessions, listCoachSessions } from "@/lib/db/repository";
import { isAuthFailure, requireAthleteId, requireCoachId } from "@/lib/api/require-auth";

function wantsLegacy(request: Request): boolean {
  const url = new URL(request.url);
  return (
    url.searchParams.get("legacy") === "1" ||
    request.headers.get("Accept") === "application/vnd.fitconnect.legacy+json"
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const coachId = searchParams.get("coachId");
  const { page, limit } = parsePagination(searchParams);

  let sessions;
  if (coachId) {
    const resolved = await requireCoachId(req, coachId);
    if (isAuthFailure(resolved)) return resolved.response;
    sessions = await listCoachSessions(resolved.coachId);
  } else {
    const resolved = await requireAthleteId(req);
    if (isAuthFailure(resolved)) return resolved.response;
    sessions = await listAthleteSessions(resolved.athleteId);
  }

  if (wantsLegacy(req)) {
    return NextResponse.json({ sessions });
  }

  return NextResponse.json(paginate(sessions, page, limit));
}
