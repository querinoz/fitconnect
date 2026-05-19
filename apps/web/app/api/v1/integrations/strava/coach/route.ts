import { NextResponse } from "next/server";
import { listActivitiesForCoach, toIntegrationActivity } from "@/lib/integrations/strava/service";
import { resolveIntegrationCoach } from "@/lib/integrations/strava/route-auth";

export async function GET(request: Request) {
  const auth = await resolveIntegrationCoach(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? 12);

  const rows = await listActivitiesForCoach(auth.coachId, limit);
  const activities = rows.map((r) => ({
    ...toIntegrationActivity(r),
    sportType: r.sportType,
    athleteName: r.athleteName
  }));

  return NextResponse.json({ coachId: auth.coachId, activities });
}
