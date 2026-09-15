import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { getDiscipline } from "@/lib/combat";
import { readCombatProfile, upsertCombatProfile } from "@/lib/combat/repository";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  const profile = await readCombatProfile(auth.user.id);
  return NextResponse.json({
    profile,
    empty: profile == null,
    note: "Ranks and records stay empty until you or a coach confirm them."
  });
}

export async function PUT(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json().catch(() => null)) as {
    primaryDisciplineId?: string | null;
    disciplines?: string[];
    rank?: string | null;
    gym?: string | null;
    coach?: string | null;
    weightClass?: string | null;
  } | null;
  if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  if (body.primaryDisciplineId && !getDiscipline(body.primaryDisciplineId)) {
    return NextResponse.json({ error: "unknown_discipline" }, { status: 404 });
  }
  const saved = await upsertCombatProfile(auth.user.id, body);
  if (saved.status === "unavailable") {
    return NextResponse.json({ error: "persistence_not_configured" }, { status: 503 });
  }
  return NextResponse.json({ ok: true, profile: saved.row });
}
