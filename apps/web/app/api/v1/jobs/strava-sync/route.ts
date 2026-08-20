import { NextResponse } from "next/server";
import {
  syncActivityById,
  syncRecentActivities,
  softDeleteActivity,
  listActivitiesForAthlete,
  toIntegrationActivity,
  getConnectionByAthlete
} from "@/lib/integrations/strava/service";
import { recalcReadinessFromActivities } from "@/lib/readiness/recalc-from-activities";
import { resolveTransport } from "@/lib/platform/realtime/resolve-transport";
import { setActivities } from "@/lib/integrations/store";
import { verifyQStashJob } from "@/lib/integrations/strava/route-auth";

type JobBody = {
  athleteExternalId?: string;
  activityId?: number;
  aspectType?: "create" | "update" | "delete";
};

/** Strava sync worker — invoked by webhook (QStash) or manual POST. */
export async function POST(request: Request) {
  if (!verifyQStashJob(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as JobBody;
  const athleteExternalId = body.athleteExternalId;
  if (!athleteExternalId) {
    return NextResponse.json({ ok: false, error: "athlete_required" }, { status: 400 });
  }
  const aspectType = body.aspectType ?? "create";

  try {
    const conn = await getConnectionByAthlete(athleteExternalId);
    if (!conn || conn.deauthorizedAt) {
      return NextResponse.json({ ok: false, error: "not_connected" });
    }

    if (aspectType === "delete" && body.activityId) {
      await softDeleteActivity(body.activityId);
      return NextResponse.json({ ok: true, deleted: body.activityId });
    }

    if (body.activityId) {
      await syncActivityById(athleteExternalId, body.activityId);
    } else {
      await syncRecentActivities(athleteExternalId, 1);
    }

    const rows = await listActivitiesForAthlete(athleteExternalId, 10);
    const mapped = rows.map(toIntegrationActivity);
    setActivities(athleteExternalId, mapped);

    const readiness = await recalcReadinessFromActivities(athleteExternalId);

    if (readiness) {
      resolveTransport(`athlete:${athleteExternalId}`).publish(`athlete:${athleteExternalId}`, {
        kind: "vitals",
        athleteId: athleteExternalId,
        hrvMs: readiness.score,
        at: new Date().toISOString()
      });
    }

    return NextResponse.json({
      ok: true,
      count: rows.length,
      readiness: readiness?.score,
      activityId: body.activityId
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
