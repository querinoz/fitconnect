import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import {
  createPostComment,
  listPostComments,
  softDeletePostComment
} from "@/lib/community/post-comments";
import { persistenceReady } from "@/lib/persistence/config";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!persistenceReady()) {
    return NextResponse.json({ error: "persistence_not_configured" }, { status: 503 });
  }
  const { id: postId } = await params;
  const comments = await listPostComments(postId);
  return NextResponse.json({ comments, source: "canonical" });
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
    text?: string;
    authorId?: string;
  } | null;

  if (body?.authorId && body.authorId !== auth.user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (!body?.text?.trim()) {
    return NextResponse.json({ error: "text_required" }, { status: 400 });
  }

  const comment = await createPostComment({
    postId,
    authorId: auth.user.id,
    text: body.text,
    accessToken: auth.accessToken
  });
  if (!comment) {
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }
  return NextResponse.json({ comment }, { status: 201 });
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

  const url = new URL(req.url);
  const commentId = url.searchParams.get("commentId");
  if (!commentId?.trim()) {
    return NextResponse.json({ error: "commentId_required" }, { status: 400 });
  }
  void params;

  const result = await softDeletePostComment({
    commentId,
    authorId: auth.user.id,
    accessToken: auth.accessToken
  });
  if (result.error === "forbidden") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (result.error === "not_found") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (!result.ok) {
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
