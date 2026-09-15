import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { sanitizeIngestEvent } from "@/lib/combat/ingest";
import { insertCombatEventForUser, insertCombatMeasurementForUser, sessionOwnedBy } from "@/lib/combat/repository";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  const { id: sessionId } = await context.params;
  const owned = await sessionOwnedBy(sessionId, auth.user.id);
  if (!owned) {
    return NextResponse.json({ error: "session_not_found" }, { status: 404 });
  }
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  const sanitized = sanitizeIngestEvent({
    id: typeof body.id === "string" ? body.id : undefined,
    sessionId,
    roundIndex: typeof body.roundIndex === "number" ? body.roundIndex : null,
    occurredAt: typeof body.occurredAt === "string" ? body.occurredAt : null,
    kind: body.kind as "strike" | "grappling" | "movement" | "impact_safety",
    payload: (body.payload as Record<string, unknown>) ?? {},
    classification: body.classification as never,
    source: body.source as never,
    confirmedBy: typeof body.confirmedBy === "string" ? body.confirmedBy : null,
    measurements: Array.isArray(body.measurements) ? (body.measurements as never) : []
  });
  if ("error" in sanitized) {
    return NextResponse.json({ error: sanitized.error }, { status: 400 });
  }
  const saved = await insertCombatEventForUser(auth.user.id, sanitized);
  if (saved.status === "unavailable") {
    return NextResponse.json({ error: "persistence_not_configured", local_only: true, event: sanitized }, { status: 503 });
  }
  if (saved.status === "forbidden") {
    return NextResponse.json({ ok: true, duplicate: true, event: sanitized });
  }
  for (const m of sanitized.measurements) {
    await insertCombatMeasurementForUser(auth.user.id, {
      sessionId,
      roundIndex: m.roundIndex,
      metric: m.metric,
      value: m.value,
      unit: m.unit,
      measurementType: m.measurementType,
      sensor: m.sensor,
      source: m.source,
      provider: m.provider,
      confidence: m.confidence,
      sampledAt: m.sampledAt
    });
  }
  return NextResponse.json({
    ok: true,
    event: sanitized,
    note: sanitized.kind === "impact_safety" ? "IMPACT_EVENT recorded. Not a diagnosis." : undefined
  });
}
