import { NextResponse } from "next/server";
import { listAthleteMessages, listCoachMessages } from "@/lib/db/repository";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const athleteId = searchParams.get("athleteId");
  const coachId = searchParams.get("coachId");

  if (coachId) {
    const messages = await listCoachMessages(coachId);
    return NextResponse.json({ messages });
  }

  if (!athleteId) {
    return NextResponse.json({ error: "athleteId or coachId required" }, { status: 400 });
  }
  const messages = await listAthleteMessages(athleteId);
  return NextResponse.json({ messages });
}
