import { NextResponse } from "next/server";
import { listAthleteSessions, listCoachSessions } from "@/lib/db/repository";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const athleteId = searchParams.get("athleteId");
  const coachId = searchParams.get("coachId");

  if (coachId) {
    const sessions = await listCoachSessions(coachId);
    return NextResponse.json({ sessions });
  }

  if (!athleteId) {
    return NextResponse.json({ error: "athleteId or coachId required" }, { status: 400 });
  }
  const sessions = await listAthleteSessions(athleteId);
  return NextResponse.json({ sessions });
}
