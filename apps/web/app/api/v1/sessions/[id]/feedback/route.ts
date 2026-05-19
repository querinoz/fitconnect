import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db/client";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = (await request.json().catch(() => null)) as {
    athleteExternalId?: string;
    rpe?: number;
    notes?: string;
  } | null;

  const rpe = body?.rpe;
  if (!rpe || rpe < 1 || rpe > 10) {
    return NextResponse.json({ error: "invalid rpe" }, { status: 400 });
  }

  const prisma = getPrisma();
  if (prisma) {
    await prisma.sessionFeedback.create({
      data: {
        sessionExternalId: params.id,
        athleteExternalId: body?.athleteExternalId ?? "a-ines",
        rpe,
        notes: body?.notes ?? null
      }
    });
  }

  return NextResponse.json({ ok: true, rpe, lighterDayRecommended: rpe >= 8 });
}
