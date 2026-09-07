import { NextResponse } from "next/server";
import { isAuthFailure, requireAthleteId } from "@/lib/api/require-auth";
import { getBodyMetrics, upsertBodyMetrics } from "@/lib/db/body-metrics";

export async function GET(req: Request) {
  const resolved = await requireAthleteId(req);
  if (isAuthFailure(resolved)) return resolved.response;
  const metrics = getBodyMetrics(resolved.athleteId);
  if (!metrics) {
    return NextResponse.json({
      metrics: {
        athleteId: resolved.athleteId,
        weightKg: 0,
        hydrationLiters: 0,
        nutritionKcal: 0,
        updatedAt: null
      },
      source: "empty"
    });
  }
  return NextResponse.json({ metrics, source: "memory" });
}

export async function PUT(req: Request) {
  const resolved = await requireAthleteId(req);
  if (isAuthFailure(resolved)) return resolved.response;
  const body = (await req.json().catch(() => null)) as {
    weightKg?: number;
    hydrationLiters?: number;
    nutritionKcal?: number;
    athleteId?: string;
  } | null;
  if (body?.athleteId && body.athleteId !== resolved.athleteId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const metrics = upsertBodyMetrics({
    athleteId: resolved.athleteId,
    weightKg: body?.weightKg,
    hydrationLiters: body?.hydrationLiters,
    nutritionKcal: body?.nutritionKcal
  });
  return NextResponse.json({ metrics, source: "memory" });
}
