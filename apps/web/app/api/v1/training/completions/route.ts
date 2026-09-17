import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import {
  listTrainingCompletions,
  saveTrainingCompletion
} from "@/lib/sport-intelligence/completion-repository";
import { SPORT_REGISTRY } from "@/lib/sport-intelligence/sport-registry";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  const url = new URL(request.url);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 30)));
  const { sessions, backend } = await listTrainingCompletions(auth.user.id, limit);
  return NextResponse.json({ sessions, backend });
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  if (body.confirm !== true) {
    return NextResponse.json(
      {
        error: "confirmation_required",
        message: "Set confirm:true after the athlete finishes the session."
      },
      { status: 400 }
    );
  }

  const sportId = String(body.sportId ?? "");
  if (!(sportId in SPORT_REGISTRY)) {
    return NextResponse.json({ error: "unknown_sport" }, { status: 400 });
  }

  const durationSec = Number(body.durationSec);
  if (!Number.isFinite(durationSec) || durationSec < 0) {
    return NextResponse.json({ error: "invalid_duration" }, { status: 400 });
  }

  const id =
    typeof body.id === "string" && body.id.length > 0
      ? body.id
      : `stc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const result = await saveTrainingCompletion({
    id,
    userId: auth.user.id,
    sportId,
    sessionType: String(body.sessionType ?? "session"),
    title: String(body.title ?? "Completed session"),
    startedAtISO:
      typeof body.startedAtISO === "string" ? body.startedAtISO : new Date().toISOString(),
    completedAtISO:
      typeof body.completedAtISO === "string" ? body.completedAtISO : new Date().toISOString(),
    durationSec,
    blocksCompleted: Number(body.blocksCompleted ?? 0),
    payload:
      body.payload && typeof body.payload === "object"
        ? (body.payload as Record<string, unknown>)
        : {},
    trainingLoadLabel:
      typeof body.trainingLoadLabel === "string" ? body.trainingLoadLabel : null,
    rpe: body.rpe != null && Number.isFinite(Number(body.rpe)) ? Number(body.rpe) : null,
    notes: typeof body.notes === "string" ? body.notes : null,
    syncState: "SYNCING"
  });

  return NextResponse.json(
    {
      ok: true,
      id,
      syncState: result.syncState,
      backend: result.backend,
      note:
        result.syncState === "SYNCED"
          ? "Persisted."
          : "Queued locally — will sync when database is available."
    },
    { status: 201 }
  );
}
