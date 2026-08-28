import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db/client";
import { requireAthleteId } from "@/lib/api/require-auth";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await enforceRateLimit(request, "highcost");
  if (limited) return limited;

  const body = (await request.json().catch(() => null)) as {
    athleteExternalId?: string;
    rpe?: number;
    notes?: string;
  } | null;

  const rpe = body?.rpe;
  if (!rpe || rpe < 1 || rpe > 10) {
    return NextResponse.json({ error: "invalid rpe" }, { status: 400 });
  }

  // SECURITY: feedback is written under the AUTHENTICATED athlete. Previously
  // this route had no auth at all and trusted `body.athleteExternalId`, so
  // anyone could forge RPE rows against any athlete on any session.
  const auth = await requireAthleteId(request, body?.athleteExternalId ?? null);
  if ("ok" in auth) return auth.response;

  const { id } = await params;
  const prisma = getPrisma();
  if (prisma) {
    await prisma.sessionFeedback.create({
      data: {
        sessionExternalId: id,
        athleteExternalId: auth.athleteId,
        rpe,
        notes: body?.notes ?? null
      }
    });
  }

  return NextResponse.json({ ok: true, rpe, lighterDayRecommended: rpe >= 8 });
}
