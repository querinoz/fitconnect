import { NextResponse } from "next/server";
import { isAuthFailure, requireAuth, requireCoachId } from "@/lib/api/require-auth";
import {
  cancelCoachSession,
  rescheduleCoachSession
} from "@/lib/db/sessions-mutate";

/**
 * Coach-owned session mutations.
 * PATCH/PUT body: { action: "reschedule", when } | { action: "cancel" }
 */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  return mutateSession(req, ctx);
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  return mutateSession(req, ctx);
}

async function mutateSession(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  if (!sessionId.trim()) {
    return NextResponse.json({ error: "sessionId_required" }, { status: 400 });
  }

  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  // Athletes cannot perform coach-only mutations
  if (!auth.demo && auth.user.role !== "coach" && auth.user.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const resolved = await requireCoachId(req);
  if (isAuthFailure(resolved)) return resolved.response;

  const body = (await req.json().catch(() => null)) as {
    action?: "reschedule" | "cancel";
    when?: string;
  } | null;

  if (body?.action !== "reschedule" && body?.action !== "cancel") {
    return NextResponse.json({ error: "action_required" }, { status: 400 });
  }

  if (body.action === "reschedule") {
    if (!body.when?.trim()) {
      return NextResponse.json({ error: "when_required" }, { status: 400 });
    }
    const result = await rescheduleCoachSession(
      resolved.coachId,
      sessionId,
      body.when
    );
    return mapMutationResponse(result);
  }

  const result = await cancelCoachSession(resolved.coachId, sessionId);
  return mapMutationResponse(result);
}

function mapMutationResponse(result: {
  ok: boolean;
  source: string;
  session?: unknown;
  error?: string;
}) {
  if (result.error === "persistence_not_configured") {
    return NextResponse.json({ error: result.error }, { status: 503 });
  }
  if (result.error === "forbidden") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (result.error === "not_found") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (result.error === "invalid_when" || result.error === "invalid_state") {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "update_failed" },
      { status: 500 }
    );
  }
  return NextResponse.json({
    ok: true,
    source: result.source,
    session: result.session
  });
}
