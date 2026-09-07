import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import {
  deletePostReaction,
  listPostReactions,
  upsertPostReaction
} from "@/lib/community/post-reactions";
import { persistenceReady } from "@/lib/persistence/config";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!persistenceReady()) {
    return NextResponse.json({ error: "persistence_not_configured" }, { status: 503 });
  }
  const { id: postId } = await params;
  const reactions = await listPostReactions(postId);
  return NextResponse.json({ reactions, source: "canonical" });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  if (!persistenceReady()) {
    return NextResponse.json({ error: "persistence_not_configured" }, { status: 503 });
  }

  const { id: postId } = await params;
  const body = (await req.json().catch(() => null)) as {
    emoji?: string;
    userId?: string;
  } | null;

  if (body?.userId && body.userId !== auth.user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const result = await upsertPostReaction({
    postId,
    userId: auth.user.id,
    emoji: body?.emoji ?? "LIKE",
    accessToken: auth.accessToken
  });
  if (!result) {
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }
  return NextResponse.json(
    { reaction: result.reaction, idempotent: result.idempotent },
    { status: result.idempotent ? 200 : 201 }
  );
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  if (!persistenceReady()) {
    return NextResponse.json({ error: "persistence_not_configured" }, { status: 503 });
  }

  const { id: postId } = await params;
  const url = new URL(req.url);
  const emoji = url.searchParams.get("emoji") ?? "LIKE";

  const result = await deletePostReaction({
    postId,
    userId: auth.user.id,
    emoji,
    accessToken: auth.accessToken
  });
  if (result.error === "not_found") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (!result.ok) {
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
