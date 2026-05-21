import { NextResponse } from "next/server";
import { listCoachRoster } from "@/lib/db/repository";
import { isAuthFailure, requireCoachId } from "@/lib/api/require-auth";

export async function GET(req: Request) {
  const resolved = await requireCoachId(req);
  if (isAuthFailure(resolved)) return resolved.response;
  const roster = await listCoachRoster(resolved.coachId);
  return NextResponse.json({ roster });
}
