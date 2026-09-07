import { createSupabaseAdminClient } from "@/lib/db/supabase-admin";
import { pgQuery } from "@/lib/db/pg-pool";
import { createSupabaseRlsClient } from "@/lib/identity/supabase-rls-client";
import { isMemoryPersistence, persistenceReady } from "@/lib/persistence/config";

export type PostReaction = {
  postId: string;
  userId: string;
  emoji: string;
  createdAt: string;
};

/** Canonical: one row per (post, user, emoji). Re-POST same emoji = idempotent keep. */
const memoryReactions = new Map<string, PostReaction>();

function key(postId: string, userId: string, emoji: string) {
  return `${postId}|${userId}|${emoji}`;
}

export function resetPostReactionsForTests() {
  memoryReactions.clear();
}

export async function listPostReactions(postId: string): Promise<PostReaction[]> {
  if (!persistenceReady()) return [];
  if (isMemoryPersistence()) {
    return [...memoryReactions.values()].filter((r) => r.postId === postId);
  }

  const admin = createSupabaseAdminClient();
  if (admin) {
    const { data, error } = await admin
      .from("post_reactions")
      .select("post_id, user_id, emoji, created_at")
      .eq("post_id", postId)
      .limit(500);
    if (!error && data) {
      return data.map((row) => ({
        postId: row.post_id as string,
        userId: row.user_id as string,
        emoji: row.emoji as string,
        createdAt: row.created_at as string
      }));
    }
  }

  const rows = await pgQuery<{
    post_id: string;
    user_id: string;
    emoji: string;
    created_at: string;
  }>(
    `select post_id, user_id, emoji, created_at
     from public.post_reactions where post_id = $1::uuid limit 500`,
    [postId]
  );
  return rows.map((r) => ({
    postId: r.post_id,
    userId: r.user_id,
    emoji: r.emoji,
    createdAt: r.created_at
  }));
}

export async function upsertPostReaction(input: {
  postId: string;
  userId: string;
  emoji: string;
  accessToken: string | null;
}): Promise<{ reaction: PostReaction; idempotent: boolean } | null> {
  const emoji = input.emoji.trim() || "LIKE";
  if (isMemoryPersistence()) {
    const k = key(input.postId, input.userId, emoji);
    const existing = memoryReactions.get(k);
    if (existing) return { reaction: existing, idempotent: true };
    const reaction: PostReaction = {
      postId: input.postId,
      userId: input.userId,
      emoji,
      createdAt: new Date().toISOString()
    };
    memoryReactions.set(k, reaction);
    return { reaction, idempotent: false };
  }

  if (input.accessToken) {
    const client = createSupabaseRlsClient(input.accessToken);
    if (client) {
      const { data: existing } = await client
        .from("post_reactions")
        .select("post_id, user_id, emoji, created_at")
        .eq("post_id", input.postId)
        .eq("user_id", input.userId)
        .eq("emoji", emoji)
        .maybeSingle();
      if (existing) {
        return {
          reaction: {
            postId: existing.post_id as string,
            userId: existing.user_id as string,
            emoji: existing.emoji as string,
            createdAt: existing.created_at as string
          },
          idempotent: true
        };
      }
      const { data, error } = await client
        .from("post_reactions")
        .insert({
          post_id: input.postId,
          user_id: input.userId,
          emoji
        })
        .select("post_id, user_id, emoji, created_at")
        .single();
      if (!error && data) {
        return {
          reaction: {
            postId: data.post_id as string,
            userId: data.user_id as string,
            emoji: data.emoji as string,
            createdAt: data.created_at as string
          },
          idempotent: false
        };
      }
    }
  }

  const existing = await pgQuery<{
    post_id: string;
    user_id: string;
    emoji: string;
    created_at: string;
  }>(
    `select post_id, user_id, emoji, created_at from public.post_reactions
     where post_id = $1::uuid and user_id = $2 and emoji = $3`,
    [input.postId, input.userId, emoji]
  );
  if (existing[0]) {
    return {
      reaction: {
        postId: existing[0].post_id,
        userId: existing[0].user_id,
        emoji: existing[0].emoji,
        createdAt: existing[0].created_at
      },
      idempotent: true
    };
  }
  const rows = await pgQuery<{
    post_id: string;
    user_id: string;
    emoji: string;
    created_at: string;
  }>(
    `insert into public.post_reactions (post_id, user_id, emoji)
     values ($1::uuid, $2, $3)
     returning post_id, user_id, emoji, created_at`,
    [input.postId, input.userId, emoji]
  );
  if (!rows[0]) return null;
  return {
    reaction: {
      postId: rows[0].post_id,
      userId: rows[0].user_id,
      emoji: rows[0].emoji,
      createdAt: rows[0].created_at
    },
    idempotent: false
  };
}

export async function deletePostReaction(input: {
  postId: string;
  userId: string;
  emoji: string;
  accessToken: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const emoji = input.emoji.trim() || "LIKE";
  if (isMemoryPersistence()) {
    const k = key(input.postId, input.userId, emoji);
    if (!memoryReactions.has(k)) return { ok: false, error: "not_found" };
    memoryReactions.delete(k);
    return { ok: true };
  }

  if (input.accessToken) {
    const client = createSupabaseRlsClient(input.accessToken);
    if (client) {
      const { data, error } = await client
        .from("post_reactions")
        .delete()
        .eq("post_id", input.postId)
        .eq("user_id", input.userId)
        .eq("emoji", emoji)
        .select("post_id")
        .maybeSingle();
      if (!error && data) return { ok: true };
      if (!error && !data) return { ok: false, error: "not_found" };
    }
  }

  const rows = await pgQuery<{ post_id: string }>(
    `delete from public.post_reactions
     where post_id = $1::uuid and user_id = $2 and emoji = $3
     returning post_id`,
    [input.postId, input.userId, emoji]
  );
  if (!rows[0]) return { ok: false, error: "not_found" };
  return { ok: true };
}
