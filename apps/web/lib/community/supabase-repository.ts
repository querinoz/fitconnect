import type { CommunityPost, Sport } from "@/lib/data";
import { createSupabaseAdminClient } from "@/lib/db/supabase-admin";
import { pgQuery } from "@/lib/db/pg-pool";
import { createSupabaseRlsClient } from "@/lib/identity/supabase-rls-client";
import { canSurfaceCommunityPost } from "@/lib/community/community-social-policy";

type PostRow = {
  id: string;
  author_id: string;
  post_kind: CommunityPost["kind"];
  content: string;
  sport: string | null;
  author_name: string;
  author_avatar: string | null;
  metric_label: string | null;
  metric_value: string | null;
  created_at: string;
  provider_id?: string | null;
  is_social_eligible?: boolean | null;
};

function agoFrom(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function mapRow(row: PostRow, likes = 0, comments = 0): CommunityPost {
  return {
    id: row.id,
    author: {
      name: row.author_name,
      avatar: row.author_avatar ?? "https://i.pravatar.cc/200?img=8",
      sport: (row.sport ?? "Running") as Sport
    },
    kind: row.post_kind,
    text: row.content,
    likes,
    comments,
    ago: agoFrom(row.created_at),
    highlight:
      row.metric_label && row.metric_value
        ? { label: row.metric_label, value: row.metric_value }
        : undefined
  };
}

function isEligibleRow(row: PostRow): boolean {
  // Admin/pg paths may bypass RLS — still honor DB invariant in app code.
  if (typeof row.is_social_eligible === "boolean") {
    return canSurfaceCommunityPost({
      providerId: row.provider_id ?? "MANUAL",
      isSocialEligible: row.is_social_eligible
    });
  }
  if (row.provider_id != null) {
    return canSurfaceCommunityPost({ providerId: row.provider_id });
  }
  // Pre-020 rows without columns: treat as eligible (default MANUAL).
  return true;
}

export async function listCommunityPostsFromSupabase(): Promise<CommunityPost[]> {
  const admin = createSupabaseAdminClient();
  if (admin) {
    // Prefer DB filter when 020 is applied; fall back if column absent.
    const filtered = await admin
      .from("community_posts")
      .select("*")
      .eq("is_social_eligible", true)
      .order("created_at", { ascending: false })
      .limit(100);
    if (!filtered.error && filtered.data) {
      return (filtered.data as PostRow[]).filter(isEligibleRow).map((row) => mapRow(row));
    }
    const { data, error } = await admin
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (!error && data) {
      return (data as PostRow[]).filter(isEligibleRow).map((row) => mapRow(row));
    }
  }

  try {
    const rows = await pgQuery<PostRow>(
      `select * from public.community_posts
       where coalesce(is_social_eligible, true)
       order by created_at desc limit 100`
    );
    return rows.filter(isEligibleRow).map((row) => mapRow(row));
  } catch {
    const rows = await pgQuery<PostRow>(
      `select * from public.community_posts order by created_at desc limit 100`
    );
    return rows.filter(isEligibleRow).map((row) => mapRow(row));
  }
}

export async function createCommunityPostInSupabase(
  input: {
    text: string;
    kind: CommunityPost["kind"];
    authorName: string;
    authorAvatar: string;
    sport?: string;
  },
  userId: string,
  accessToken: string
): Promise<CommunityPost | null> {
  const client = createSupabaseRlsClient(accessToken);
  if (client) {
    const withProvider = await client
      .from("community_posts")
      .insert({
        author_id: userId,
        post_kind: input.kind,
        content: input.text,
        sport: input.sport ?? "Running",
        author_name: input.authorName,
        author_avatar: input.authorAvatar,
        provider_id: "MANUAL"
      })
      .select("*")
      .single();
    if (!withProvider.error && withProvider.data) {
      return mapRow(withProvider.data as PostRow);
    }
    // Pre-020 schemas lack provider_id — insert without it.
    const { data, error } = await client
      .from("community_posts")
      .insert({
        author_id: userId,
        post_kind: input.kind,
        content: input.text,
        sport: input.sport ?? "Running",
        author_name: input.authorName,
        author_avatar: input.authorAvatar
      })
      .select("*")
      .single();
    if (!error && data) return mapRow(data as PostRow);
  }

  try {
    const rows = await pgQuery<PostRow>(
      `insert into public.community_posts
        (author_id, post_kind, content, sport, author_name, author_avatar, provider_id)
       values ($1, $2, $3, $4, $5, $6, 'MANUAL')
       returning *`,
      [
        userId,
        input.kind,
        input.text,
        input.sport ?? "Running",
        input.authorName,
        input.authorAvatar
      ]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  } catch {
    const rows = await pgQuery<PostRow>(
      `insert into public.community_posts
        (author_id, post_kind, content, sport, author_name, author_avatar)
       values ($1, $2, $3, $4, $5, $6)
       returning *`,
      [
        userId,
        input.kind,
        input.text,
        input.sport ?? "Running",
        input.authorName,
        input.authorAvatar
      ]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }
}
