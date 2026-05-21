import { NextResponse } from "next/server";
import { listAthleteMessages, listCoachMessages } from "@/lib/db/repository";
import { isAuthFailure, requireAthleteId, requireCoachId } from "@/lib/api/require-auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const coachId = searchParams.get("coachId");

  if (coachId) {
    const resolved = await requireCoachId(req, coachId);
    if (isAuthFailure(resolved)) return resolved.response;
    const messages = await listCoachMessages(resolved.coachId);
    return NextResponse.json({ messages });
  }

  const resolved = await requireAthleteId(req);
  if (isAuthFailure(resolved)) return resolved.response;
  const messages = await listAthleteMessages(resolved.athleteId);
  return NextResponse.json({ messages });
}
