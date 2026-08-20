import { NextResponse } from "next/server";
import { listActivitiesForAthlete, syncActivityById } from "@/lib/integrations/strava/service";
import { resolveIntegrationAthlete } from "@/lib/integrations/strava/route-auth";
import { getPrisma } from "@/lib/db/client";
import { canAccessStravaOwnedRecord } from "@/lib/fitness/workout-session-policy";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "strava");
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const auth = await resolveIntegrationAthlete(request, searchParams.get("athleteId"));
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const stravaId = Number(searchParams.get("id"));
  if (!Number.isFinite(stravaId)) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  const prisma = getPrisma();
  if (prisma) {
    let row = await prisma.stravaActivity.findUnique({ where: { stravaId } });
    if (!row || !row.streamsJson) {
      await syncActivityById(auth.athleteId, stravaId).catch(() => undefined);
      row = await prisma.stravaActivity.findUnique({ where: { stravaId } });
    }
    if (row) {
      if (!canAccessStravaOwnedRecord({ actorId: auth.athleteId, ownerId: row.athleteExternalId })) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }
      return NextResponse.json({
        activity: {
          id: String(row.stravaId),
          name: row.name,
          sportType: row.sportType,
          distanceM: row.distanceM,
          movingTimeSec: row.movingTimeSec,
          avgHr: row.avgHr ?? undefined,
          elevationM: row.elevationM ?? undefined,
          mapPolyline: row.mapSummaryPolyline ?? row.mapPolyline,
          streamsJson: row.streamsJson as Record<string, { data: number[] }> | undefined
        }
      });
    }
  }

  const rows = await listActivitiesForAthlete(auth.athleteId, 50);
  const fallback = rows.find((r) => r.stravaId === stravaId);
  if (!fallback) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    activity: {
      id: String(fallback.stravaId),
      name: fallback.name,
      sportType: fallback.sportType,
      distanceM: fallback.distanceM,
      movingTimeSec: fallback.movingTimeSec,
      avgHr: fallback.avgHr ?? undefined,
      elevationM: fallback.elevationM ?? undefined,
      mapPolyline: fallback.mapSummaryPolyline ?? fallback.mapPolyline
    }
  });
}
