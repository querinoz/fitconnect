import { NextResponse } from "next/server";
import {
  createDirectMessage,
  listDirectMessages
} from "@/lib/db/direct-messages";
import {
  isAuthFailure,
  requireAthleteId,
  requireAuth,
  requireCoachId
} from "@/lib/api/require-auth";
import { publishDirectMessage } from "@/lib/realtime/publish-message";
import { getPrisma } from "@/lib/db/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const coachId = searchParams.get("coachId");

  if (coachId) {
    const resolved = await requireCoachId(req, coachId);
    if (isAuthFailure(resolved)) return resolved.response;
    const memory = listDirectMessages({ coachId: resolved.coachId });
    if (memory.length > 0) {
      return NextResponse.json({ messages: memory, source: "memory" });
    }
    const { listCoachMessages } = await import("@/lib/db/repository");
    const messages = await listCoachMessages(resolved.coachId);
    return NextResponse.json({ messages, source: "repository" });
  }

  const resolved = await requireAthleteId(req);
  if (isAuthFailure(resolved)) return resolved.response;
  const memory = listDirectMessages({ athleteId: resolved.athleteId });
  if (memory.length > 0) {
    return NextResponse.json({ messages: memory, source: "memory" });
  }
  const { listAthleteMessages } = await import("@/lib/db/repository");
  const messages = await listAthleteMessages(resolved.athleteId);
  return NextResponse.json({ messages, source: "repository" });
}

/**
 * Athlete → coach DM (Discover Message). Coach → athlete also accepted when role=coach.
 * Memory-first for Wave 3 API closure; Prisma when available.
 */
export async function POST(req: Request) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const body = (await req.json().catch(() => null)) as {
    coachId?: string;
    athleteId?: string;
    preview?: string;
    body?: string;
  } | null;

  const preview = (body?.preview ?? body?.body ?? "").trim();
  if (!preview) {
    return NextResponse.json({ error: "preview_required" }, { status: 400 });
  }

  let athleteId: string;
  let coachId: string;
  let from: "athlete" | "coach";

  if (auth.user.role === "coach" || auth.user.role === "admin") {
    const resolved = await requireCoachId(req);
    if (isAuthFailure(resolved)) return resolved.response;
    coachId = resolved.coachId;
    athleteId = body?.athleteId?.trim() ?? "";
    if (!athleteId) {
      return NextResponse.json({ error: "athleteId_required" }, { status: 400 });
    }
    from = "coach";
  } else {
    const resolved = await requireAthleteId(req);
    if (isAuthFailure(resolved)) return resolved.response;
    athleteId = resolved.athleteId;
    coachId = body?.coachId?.trim() ?? "";
    if (!coachId) {
      return NextResponse.json({ error: "coachId_required" }, { status: 400 });
    }
    from = "athlete";
  }

  const db = getPrisma();
  if (db) {
    try {
      const externalId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const row = await db.message.create({
        data: {
          externalId,
          athleteExternalId: athleteId,
          coachExternalId: coachId,
          fromRole: from,
          preview,
          sentAt: new Date(),
          unread: true
        }
      });
      const message = {
        id: row.externalId,
        athleteId: row.athleteExternalId,
        coachId: row.coachExternalId,
        from: row.fromRole as "athlete" | "coach",
        preview: row.preview,
        when: row.sentAt.toISOString(),
        unread: row.unread
      };
      publishDirectMessage(message);
      return NextResponse.json({ message, source: "postgres" }, { status: 201 });
    } catch {
      /* fall through to memory */
    }
  }

  const message = createDirectMessage({ athleteId, coachId, from, preview });
  publishDirectMessage(message);
  return NextResponse.json({ message, source: "memory" }, { status: 201 });
}
