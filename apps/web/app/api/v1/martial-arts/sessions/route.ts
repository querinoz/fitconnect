import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { getDiscipline } from "@/lib/combat";
import { insertCombatSession, listCombatSessions } from "@/lib/combat/repository";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  const items = await listCombatSessions(auth.user.id);
  return NextResponse.json({ items, owner: auth.user.id });
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json().catch(() => null)) as {
    sessionId?: string;
    disciplineId?: string;
    sessionMode?: string;
    startedAt?: string;
    endedAt?: string | null;
    roundsCompleted?: number;
    rpe?: number | null;
    notes?: string | null;
  } | null;
  if (!body?.sessionId || !body.disciplineId) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (!getDiscipline(body.disciplineId)) {
    return NextResponse.json({ error: "unknown_discipline" }, { status: 404 });
  }
  const saved = await insertCombatSession({
    id: body.sessionId,
    userId: auth.user.id,
    disciplineId: body.disciplineId,
    sessionMode: body.sessionMode ?? "technique",
    startedAt: body.startedAt ?? new Date().toISOString(),
    endedAt: body.endedAt ?? null,
    roundsCompleted: body.roundsCompleted ?? 0,
    rpe: body.rpe ?? null,
    notes: body.notes ?? null
  });
  if (saved.status === "unavailable") {
    return NextResponse.json(
      { error: "persistence_not_configured", local_only: true },
      { status: 503 }
    );
  }
  return NextResponse.json({ ok: true, session: saved.row, duplicate: saved.duplicate });
}
