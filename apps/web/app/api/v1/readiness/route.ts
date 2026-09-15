import { NextResponse } from "next/server";
import { recalcReadinessFromActivities } from "@/lib/readiness/recalc-from-activities";
import { resolveIntegrationAthlete } from "@/lib/integrations/strava/route-auth";
import { getPrisma } from "@/lib/db/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const auth = await resolveIntegrationAthlete(request, searchParams.get("athleteId"));
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const recalc = await recalcReadinessFromActivities(auth.athleteId);
  if (recalc?.score != null) {
  return NextResponse.json({
    score: recalc.score,
    source: "strava",
    provider: "STRAVA",
    confidence: "derived",
    unit: "score",
    measuredAt: null,
    hrvMs: null,
    sleepHours: null,
    restingHrBpm: null
  });
  }

  const prisma = getPrisma();
  if (prisma) {
    const athlete = await prisma.athleteProfile.findUnique({
      where: { externalId: auth.athleteId },
      select: { readiness: true }
    });
    if (athlete) {
      return NextResponse.json({
        score: athlete.readiness,
        source: "profile",
        provider: "FITCONNECT",
        confidence: "derived",
        unit: "score",
        measuredAt: null,
        hrvMs: null,
        sleepHours: null,
        restingHrBpm: null
      });
    }
  }

  return NextResponse.json({
    score: null,
    source: "insufficient_data",
    provider: "none",
    confidence: "missing",
    unit: "score",
    measuredAt: null,
    hrvMs: null,
    sleepHours: null,
    restingHrBpm: null
  });
}
