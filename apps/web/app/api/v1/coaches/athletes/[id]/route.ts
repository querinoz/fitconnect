import { NextResponse } from "next/server";
import { getCoachAthleteDetail } from "@/lib/db/repository";
import { isAuthFailure, requireCoachOwnsAthlete } from "@/lib/api/require-auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: athleteId } = await params;
  const resolved = await requireCoachOwnsAthlete(req, athleteId);
  if (isAuthFailure(resolved)) return resolved.response;

  const { athlete, source } = await getCoachAthleteDetail(
    resolved.coachId,
    resolved.athleteId
  );
  if (!athlete) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (source === "seed") {
    return NextResponse.json(
      { error: "coach_athlete_seed_forbidden_in_remote_path" },
      { status: 503 }
    );
  }
  return NextResponse.json({ athlete, source });
}
