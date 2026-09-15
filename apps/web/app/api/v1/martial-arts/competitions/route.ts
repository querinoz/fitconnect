import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { getDiscipline } from "@/lib/combat";
import { sanitizeCompetition } from "@/lib/combat/competition";
import { insertCombatCompetition, listCombatCompetitions } from "@/lib/combat/repository";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  const items = await listCombatCompetitions(auth.user.id);
  return NextResponse.json({ items, owner: auth.user.id });
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json().catch(() => null)) as {
    disciplineId?: string;
    rulesetId?: string;
    rulesetVersion?: string;
    weightClass?: string | null;
    ageClass?: string | null;
    eventName?: string | null;
    outcome?: "win" | "loss" | "draw" | "nc" | "exhibition" | null;
    method?: string | null;
    score?: string | null;
    source?: "official" | "athlete" | "coach";
    notes?: string | null;
    occurredAt?: string;
  } | null;
  if (!body?.disciplineId || !body.rulesetId || !body.rulesetVersion || !body.source) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const discipline = getDiscipline(body.disciplineId);
  if (!discipline) return NextResponse.json({ error: "unknown_discipline" }, { status: 404 });
  const ruleset = discipline.rulesets.find((r) => r.id === body.rulesetId && r.version === body.rulesetVersion);
  if (!ruleset) {
    return NextResponse.json({ error: "unknown_ruleset_version" }, { status: 400 });
  }
  if (body.source === "official" && !body.eventName) {
    return NextResponse.json({ error: "official_source_requires_event" }, { status: 400 });
  }
  const sanitized = sanitizeCompetition({
    disciplineId: body.disciplineId,
    rulesetId: body.rulesetId,
    rulesetVersion: body.rulesetVersion,
    weightClass: body.weightClass ?? null,
    ageClass: body.ageClass ?? null,
    eventName: body.eventName ?? null,
    outcome: body.outcome ?? null,
    method: body.method ?? null,
    score: body.score ?? null,
    source: body.source,
    notes: body.notes ?? null
  });
  const saved = await insertCombatCompetition(auth.user.id, {
    ...sanitized,
    occurredAt: body.occurredAt ?? new Date().toISOString()
  });
  if (saved.status === "unavailable") {
    return NextResponse.json({ error: "persistence_not_configured", local_only: true }, { status: 503 });
  }
  return NextResponse.json({ ok: true, competition: saved.row });
}
