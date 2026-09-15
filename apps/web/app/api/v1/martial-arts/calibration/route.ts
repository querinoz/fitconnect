import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { listCombatCalibrations, upsertCombatCalibration } from "@/lib/combat/repository";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  const items = await listCombatCalibrations(auth.user.id);
  return NextResponse.json({ items, empty: items.length === 0 });
}

export async function PUT(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json().catch(() => null)) as {
    deviceId?: string;
    sensor?: string;
    dominantSide?: string | null;
    placement?: string | null;
    samplingHz?: number | null;
    orientation?: string | null;
  } | null;
  if (!body?.deviceId || !body.sensor) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const saved = await upsertCombatCalibration(auth.user.id, {
    deviceId: body.deviceId,
    sensor: body.sensor,
    dominantSide: body.dominantSide ?? null,
    placement: body.placement ?? null,
    samplingHz: body.samplingHz ?? null,
    orientation: body.orientation ?? null
  });
  if (saved.status === "unavailable") {
    return NextResponse.json({ error: "persistence_not_configured" }, { status: 503 });
  }
  return NextResponse.json({ ok: true, calibration: saved.row });
}
