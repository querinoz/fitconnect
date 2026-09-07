import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { getPrisma, isDatabaseConfigured } from "@/lib/db/client";
import { canSelectWorkoutSession } from "@/lib/fitness/workout-session-policy";
import {
  assertGuidedOwnership,
  assertGuidedProvider,
  upsertGuidedWorkoutCompletion,
  type GuidedWorkoutCompletionBody
} from "@/lib/fitness/complete-guided-workout";
import {
  assertOutdoorOwnership,
  assertOutdoorProvider,
  upsertOutdoorActivityCompletion,
  type OutdoorActivityCompletionBody
} from "@/lib/fitness/complete-outdoor-activity";

/**
 * Canonical activities read/write (P1-DATA).
 * POST: MANUAL → guided strength; GPS → outdoor + route points.
 */
export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const targetUserId = url.searchParams.get("userId") ?? auth.user.id;
  const prisma = getPrisma();
  if (!prisma || !isDatabaseConfigured()) {
    return NextResponse.json({ items: [], source: "LOCAL_DEMO" });
  }

  try {
    const rows = await prisma.$queryRaw<
      Array<{
        id: string;
        user_id: string;
        provider: string;
        visibility: "private" | "public" | "followers";
        shareable: boolean | null;
      }>
    >`select id, user_id, provider, visibility, shareable from activities where user_id = ${targetUserId}`;

    const items = rows.filter((row) =>
      canSelectWorkoutSession(auth.user.id, {
        userId: row.user_id,
        provider: row.provider,
        visibility: row.visibility,
        shareable: row.shareable ?? undefined
      })
    );

    return NextResponse.json({ items, source: "postgres", table: "activities" });
  } catch {
    return NextResponse.json({ items: [], source: "unavailable" });
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as
    | (GuidedWorkoutCompletionBody & OutdoorActivityCompletionBody)
    | null;
  if (!body?.sessionId || !body.userId || !body.idempotencyKey || !body.activityId) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (!assertGuidedOwnership(auth.user.id, body.userId) || !assertOutdoorOwnership(auth.user.id, body.userId)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (!isDatabaseConfigured() || !getPrisma()) {
    return NextResponse.json({ error: "persistence_not_configured" }, { status: 503 });
  }

  const provider = (body.provider ?? "MANUAL").toUpperCase();
  try {
    if (provider === "GPS") {
      if (!assertOutdoorProvider(provider)) {
        return NextResponse.json({ error: "invalid_provider" }, { status: 400 });
      }
      const result = await upsertOutdoorActivityCompletion(body);
      return NextResponse.json({
        ok: true,
        activityId: result.activityId,
        duplicate: result.duplicate,
        pointsWritten: result.pointsWritten,
        source: result.source
      });
    }
    if (!assertGuidedProvider(provider)) {
      return NextResponse.json({ error: "invalid_provider" }, { status: 400 });
    }
    const result = await upsertGuidedWorkoutCompletion(body);
    return NextResponse.json({
      ok: true,
      activityId: result.activityId,
      duplicate: result.duplicate,
      source: result.source
    });
  } catch {
    return NextResponse.json({ error: "upsert_failed" }, { status: 500 });
  }
}
