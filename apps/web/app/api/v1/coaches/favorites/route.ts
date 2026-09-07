import { NextResponse } from "next/server";
import { isAuthFailure, requireCoachId } from "@/lib/api/require-auth";
import { toggleCoachFavorite } from "@/lib/db/coach-favorites";

export async function POST(req: Request) {
  const resolved = await requireCoachId(req);
  if (isAuthFailure(resolved)) return resolved.response;
  const body = (await req.json().catch(() => null)) as { athleteId?: string } | null;
  if (!body?.athleteId?.trim()) {
    return NextResponse.json({ error: "athleteId_required" }, { status: 400 });
  }
  const result = toggleCoachFavorite(resolved.coachId, body.athleteId.trim());
  return NextResponse.json({ favorite: result, source: "memory" });
}
