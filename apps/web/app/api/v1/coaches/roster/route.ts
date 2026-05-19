import { NextResponse } from "next/server";
import { listCoachRoster } from "@/lib/db/repository";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const coachId = searchParams.get("coachId");
  if (!coachId) {
    return NextResponse.json({ error: "coachId required" }, { status: 400 });
  }
  const roster = await listCoachRoster(coachId);
  return NextResponse.json({ roster });
}
