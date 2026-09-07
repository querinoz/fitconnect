import { randomUUID } from "crypto";
import { createSupabaseAdminClient } from "@/lib/db/supabase-admin";
import { pgQuery } from "@/lib/db/pg-pool";
import { createSupabaseRlsClient } from "@/lib/identity/supabase-rls-client";
import { isMemoryPersistence, persistenceReady } from "@/lib/persistence/config";

export type PostComment = {
  id: string;
  postId: string;
  authorId: string;
  text: string;
  createdAt: string;
};

const memoryComments = new Map<string, PostComment>();

export function resetPostCommentsForTests() {
  memoryComments.clear();
}

export async function listPostComments(postId: string): Promise<PostComment[]> {
  if (!persistenceReady()) return [];
  if (isMemoryPersistence()) {
    return [...memoryComments.values()]
      .filter((c) => c.postId === postId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  const admin = createSupabaseAdminClient();
  if (admin) {
    const { data, error } = await admin
      .from("post_comments")
      .select("id, post_id, author_id, body, created_at")
      .eq("post_id", postId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(100);
    if (!error && data) {
      return data.map((row) => ({
        id: row.id as string,
        postId: row.post_id as string,
        authorId: row.author_id as string,
        text: row.body as string,
        createdAt: row.created_at as string
      }));
    }
  }

  const rows = await pgQuery<{
    id: string;
    post_id: string;
    author_id: string;
    body: string;
    created_at: string;
  }>(
    `select id, post_id, author_id, body, created_at
     from public.post_comments
     where post_id = $1::uuid and deleted_at is null
     order by created_at asc
     limit 100`,
    [postId]
  );
  return rows.map((r) => ({
    id: r.id,
    postId: r.post_id,
    authorId: r.author_id,
    text: r.body,
    createdAt: r.created_at
  }));
}

export async function createPostComment(input: {
  postId: string;
  authorId: string;
  text: string;
  accessToken: string | null;
}): Promise<PostComment | null> {
  const text = input.text.trim();
  if (!text) return null;

  if (isMemoryPersistence()) {
    const comment: PostComment = {
      id: `cmt-${randomUUID()}`,
      postId: input.postId,
      authorId: input.authorId,
      text,
      createdAt: new Date().toISOString()
    };
    memoryComments.set(comment.id, comment);
    return comment;
  }

  if (input.accessToken) {
    const client = createSupabaseRlsClient(input.accessToken);
    if (client) {
      const { data, error } = await client
        .from("post_comments")
        .insert({
          post_id: input.postId,
          author_id: input.authorId,
          body: text
        })
        .select("id, post_id, author_id, body, created_at")
        .single();
      if (!error && data) {
        return {
          id: data.id as string,
          postId: data.post_id as string,
          authorId: data.author_id as string,
          text: data.body as string,
          createdAt: data.created_at as string
        };
      }
    }
  }

  const rows = await pgQuery<{
    id: string;
    post_id: string;
    author_id: string;
    body: string;
    created_at: string;
  }>(
    `insert into public.post_comments (post_id, author_id, body)
     values ($1::uuid, $2, $3)
     returning id, post_id, author_id, body, created_at`,
    [input.postId, input.authorId, text]
  );
  const r = rows[0];
  if (!r) return null;
  return {
    id: r.id,
    postId: r.post_id,
    authorId: r.author_id,
    text: r.body,
    createdAt: r.created_at
  };
}

export async function softDeletePostComment(input: {
  commentId: string;
  authorId: string;
  accessToken: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  if (isMemoryPersistence()) {
    const row = memoryComments.get(input.commentId);
    if (!row) return { ok: false, error: "not_found" };
    if (row.authorId !== input.authorId) return { ok: false, error: "forbidden" };
    memoryComments.delete(input.commentId);
    return { ok: true };
  }

  if (input.accessToken) {
    const client = createSupabaseRlsClient(input.accessToken);
    if (client) {
      const { data, error } = await client
        .from("post_comments")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", input.commentId)
        .eq("author_id", input.authorId)
        .select("id")
        .maybeSingle();
      if (!error && data) return { ok: true };
      if (!error && !data) return { ok: false, error: "not_found" };
    }
  }

  const rows = await pgQuery<{ id: string }>(
    `update public.post_comments
     set deleted_at = now()
     where id = $1::uuid and author_id = $2 and deleted_at is null
     returning id`,
    [input.commentId, input.authorId]
  );
  if (!rows[0]) return { ok: false, error: "not_found" };
  return { ok: true };
}
