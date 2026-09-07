import { NextResponse } from "next/server";
import { isAuthFailure, requireCoachId } from "@/lib/api/require-auth";
import {
  getCancellationPolicy,
  listAvailability
} from "@/lib/db/coach-settings";

export async function GET(req: Request) {
  const resolved = await requireCoachId(req);
  if (isAuthFailure(resolved)) return resolved.response;
  return NextResponse.json({
    availability: listAvailability(resolved.coachId),
    cancellationPolicy: getCancellationPolicy(resolved.coachId),
    documents: [] as { id: string; name: string; url: string }[],
    source: "memory"
  });
}
