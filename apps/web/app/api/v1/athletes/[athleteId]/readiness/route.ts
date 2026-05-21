import { NextResponse } from "next/server";
import { getAthleteReadiness } from "@/lib/db/repository";
import { isAuthFailure, requireAthleteId } from "@/lib/api/require-auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ athleteId: string }> }
) {
  const { athleteId } = await params;
  const resolved = await requireAthleteId(req, athleteId);
  if (isAuthFailure(resolved)) return resolved.response;

  const data = await getAthleteReadiness(resolved.athleteId);
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}
