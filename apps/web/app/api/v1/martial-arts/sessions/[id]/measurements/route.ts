import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { assertHonestForce } from "@/lib/combat/measurement";
import { insertCombatMeasurementForUser, sessionOwnedBy } from "@/lib/combat/repository";
import type { CombatMeasurement } from "@fitconnect/types";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  const { id: sessionId } = await context.params;
  if (!(await sessionOwnedBy(sessionId, auth.user.id))) {
    return NextResponse.json({ error: "session_not_found" }, { status: 404 });
  }
  const body = (await request.json().catch(() => null)) as CombatMeasurement | null;
  if (!body || !body.metric) return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  const honest = assertHonestForce({ ...body, sessionId });
  const saved = await insertCombatMeasurementForUser(auth.user.id, {
    sessionId,
    roundIndex: honest.roundIndex,
    metric: honest.metric,
    value: honest.value,
    unit: honest.unit,
    measurementType: honest.measurementType,
    sensor: honest.sensor,
    source: honest.source,
    provider: honest.provider,
    confidence: honest.confidence,
    sampledAt: honest.sampledAt
  });
  if (saved.status === "unavailable") {
    return NextResponse.json({ error: "persistence_not_configured", local_only: true, measurement: honest }, { status: 503 });
  }
  if (saved.status === "forbidden") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return NextResponse.json({ ok: true, measurement: honest });
}
