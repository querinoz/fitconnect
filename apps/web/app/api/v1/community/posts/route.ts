import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import {
  createCommunityPost,
  listCommunityPosts
} from "@/lib/community/server-posts";
import {
  createCommunityPostInSupabase,
  listCommunityPostsFromSupabase
} from "@/lib/community/supabase-repository";
import type { CommunityPost } from "@/lib/data";
import { persistenceReady, isMemoryPersistence } from "@/lib/persistence/config";

export async function GET() {
  if (!persistenceReady()) {
    return NextResponse.json({ error: "persistence_not_configured" }, { status: 503 });
  }

  if (isMemoryPersistence()) {
    const posts = listCommunityPosts();
    return NextResponse.json({ posts, source: "memory" });
  }

  const posts = await listCommunityPostsFromSupabase();
  return NextResponse.json({ posts, source: "supabase" });
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  if (!persistenceReady()) {
    return NextResponse.json({ error: "persistence_not_configured" }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as {
    text?: string;
    kind?: CommunityPost["kind"];
    author?: CommunityPost["author"];
  } | null;

  if (!body?.text?.trim()) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  const authorName = body.author?.name ?? (auth.demo ? "You" : auth.user.email ?? "Athlete");
  const authorAvatar = body.author?.avatar ?? "https://i.pravatar.cc/200?img=8";
  const sport = body.author?.sport ?? "Running";

  if (isMemoryPersistence()) {
    const post = createCommunityPost({
      id: `c-user-${Date.now()}`,
      author: body.author ?? { name: authorName, avatar: authorAvatar, sport: sport as CommunityPost["author"]["sport"] },
      kind: body.kind ?? "Check-in",
      text: body.text.trim()
    });
    return NextResponse.json({ post, source: "memory" }, { status: 201 });
  }

  if (!auth.accessToken) {
    return NextResponse.json({ error: "token_required" }, { status: 401 });
  }

  const post = await createCommunityPostInSupabase(
    {
      text: body.text.trim(),
      kind: body.kind ?? "Check-in",
      authorName,
      authorAvatar,
      sport
    },
    auth.user.id,
    auth.accessToken
  );

  if (!post) {
    return NextResponse.json({ error: "create_failed" }, { status: 403 });
  }

  return NextResponse.json({ post, source: "supabase" }, { status: 201 });
}
