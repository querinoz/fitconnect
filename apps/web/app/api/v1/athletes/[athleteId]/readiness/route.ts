import { NextResponse } from "next/server";
import {
  getAthleteReadiness,
  listAthleteMessages,
  listAthleteSessions,
  listCoachRoster
} from "@/lib/db/repository";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ athleteId: string }> }
) {
  const { athleteId } = await params;
  const data = await getAthleteReadiness(athleteId);
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}
