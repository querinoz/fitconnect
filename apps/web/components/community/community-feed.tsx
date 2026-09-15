"use client";

import { useCallback, useEffect, useState } from "react";
import type { CommunityPost, Sport } from "@/lib/data";
import { useChannel } from "@/lib/realtime/use-channel";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui-glass/premium-system";
import { cn } from "@/lib/utils";
import { Heart, MessageCircle, Share2, Flag } from "lucide-react";

type FeedPost = CommunityPost & { reactions: Record<string, number> };

type PostComment = {
  id: string;
  postId: string;
  authorId: string;
  text: string;
  createdAt: string;
};

function withReactions(post: CommunityPost): FeedPost {
  return {
    ...post,
    reactions: {
      "🔥": post.likes,
      "💪": 0,
      "👏": 0
    }
  };
}

export function CommunityFeed({
  filteredIds
}: {
  filteredIds: Set<string> | null;
}) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [kind, setKind] = useState<CommunityPost["kind"]>("Check-in");
  const [offline, setOffline] = useState(false);
  const { messages, send } = useChannel("community:feed");

  useEffect(() => {
    const onStatus = () => setOffline(typeof navigator !== "undefined" && navigator.onLine === false);
    onStatus();
    window.addEventListener("online", onStatus);
    window.addEventListener("offline", onStatus);
    return () => {
      window.removeEventListener("online", onStatus);
      window.removeEventListener("offline", onStatus);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        if (typeof navigator !== "undefined" && navigator.onLine === false) {
          if (!cancelled) {
            setError("You are offline. Posts already on this device stay visible; new posts will not publish.");
            setLoading(false);
          }
          return;
        }
        const res = await fetch("/api/v1/community/posts");
        if (res.status === 503) {
          if (!cancelled) {
            setPosts([]);
            setError("Feed is unavailable until persistence is configured.");
          }
          return;
        }
        if (!res.ok) throw new Error("feed unavailable");
        const body = (await res.json()) as { posts: CommunityPost[] };
        if (!cancelled) {
          setPosts(body.posts.map(withReactions));
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setPosts([]);
          setError("Could not load the feed. Try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    function onRefresh() {
      void load();
    }
    window.addEventListener("fitconnect:community-refresh", onRefresh);
    return () => {
      cancelled = true;
      window.removeEventListener("fitconnect:community-refresh", onRefresh);
    };
  }, []);

  useEffect(() => {
    const latest = messages.at(-1);
    if (!latest || latest.kind !== "community-post") return;
    setPosts((prev) => {
      if (prev.some((p) => p.id === latest.id)) return prev;
      return [
        {
          id: latest.id,
          author: {
            name: latest.author.name,
            avatar: latest.author.avatar,
            sport: latest.author.sport as Sport
          },
          kind: latest.postKind,
          text: latest.text,
          likes: 0,
          comments: 0,
          ago: "just now",
          reactions: { "🔥": 0, "💪": 0, "👏": 0 }
        },
        ...prev
      ];
    });
  }, [messages]);

  const visible = filteredIds
    ? posts.filter(
        (p) => filteredIds.has(p.id) || p.id.startsWith("c-user-")
      )
    : posts;

  const publish = useCallback(async () => {
    if (!draft.trim()) return;
    if (offline) {
      setPostError("You are offline. Nothing was published.");
      return;
    }
    const postKind = kind;
    const text = draft.trim();
    setPostError(null);
    const res = await fetch("/api/v1/community/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, kind: postKind })
    });
    if (res.status === 401) {
      setPostError("Sign in to post. We will not create a fake check-in.");
      return;
    }
    if (!res.ok) {
      setPostError("Post failed. Nothing was published.");
      return;
    }
    const body = (await res.json()) as { post: CommunityPost };
    const post = body.post;
    send({
      kind: "community-post",
      id: post.id,
      author: {
        name: post.author.name,
        avatar: post.author.avatar,
        sport: post.author.sport
      },
      postKind: post.kind,
      text: post.text,
      at: new Date().toISOString()
    });
    setPosts((prev) => [withReactions(post), ...prev]);
    setDraft("");
  }, [draft, kind, send, offline]);

  async function react(postId: string, emoji: string) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              reactions: {
                ...p.reactions,
                [emoji]: (p.reactions[emoji] ?? 0) + 1
              }
            }
          : p
      )
    );
    const res = await fetch(`/api/v1/community/posts/${encodeURIComponent(postId)}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji })
    });
    if (!res.ok) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                reactions: {
                  ...p.reactions,
                  [emoji]: Math.max(0, (p.reactions[emoji] ?? 1) - 1)
                }
              }
            : p
        )
      );
    }
  }

  async function share(post: FeedPost) {
    const url = `${window.location.origin}/feed`;
    const payload = `${post.text}\n${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "FitConnect", text: post.text, url });
        return;
      }
    } catch {
      return;
    }
    await navigator.clipboard.writeText(payload);
  }

  async function report(postId: string) {
    const res = await fetch(`/api/v1/community/posts/${encodeURIComponent(postId)}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "user_report" })
    });
    if (!res.ok) {
      setPostError("Report was not stored. Try again after signing in.");
      return;
    }
    setPostError("Report received. We will not hide the post until moderation runs.");
  }

  return (
    <div className="space-y-6">
      {offline ? (
        <p role="status" className="text-sm text-eos-recovery">
          Offline — new posts, comments, and reactions will not publish.
        </p>
      ) : null}
      <PremiumCard className="p-4 space-y-3">
        <p className="text-sm font-semibold text-ink-100">Create post</p>
        <div className="flex flex-wrap gap-1.5">
          {(["PR", "Check-in", "Race", "Question"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase",
                kind === k
                  ? "border-plasma-400/50 bg-plasma-500/15 text-plasma-200"
                  : "border-ink-800 text-ink-500"
              )}
            >
              {k}
            </button>
          ))}
        </div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="Share a PR, check-in, or race report…"
          className="w-full rounded-xl border border-ink-800 bg-ink-950/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/60"
        />
        <Button type="button" size="sm" onClick={() => void publish()} disabled={!draft.trim() || offline}>
          Post to feed
        </Button>
        {postError ? (
          <p className="text-xs text-eos-alert" role="alert">
            {postError}
          </p>
        ) : (
          <p className="text-[10px] text-ink-500">
            Strava activities never appear here. Failed posts are not shown as published.
          </p>
        )}
      </PremiumCard>

      {loading ? (
        <p className="text-sm text-ink-500">Loading community feed…</p>
      ) : null}

      {error ? (
        <PremiumCard className="p-5 space-y-2">
          <p className="font-semibold text-ink-100">Feed unavailable</p>
          <p className="text-sm text-ink-400">{error}</p>
        </PremiumCard>
      ) : null}

      {!loading && !error && visible.length === 0 ? (
        <PremiumCard className="p-5 space-y-2">
          <p className="font-semibold text-ink-100">Your squad is quiet</p>
          <p className="text-sm text-ink-400">
            Post a check-in to start the Feed. Training metrics live on Dashboard — never here.
          </p>
        </PremiumCard>
      ) : null}

      {visible.map((post) => (
        <PremiumCard key={post.id} className="p-5 space-y-3">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.author.avatar}
              alt=""
              className="h-10 w-10 rounded-full ring-2 ring-ink-800 object-cover"
            />
            <div>
              <p className="font-semibold text-ink-100">{post.author.name}</p>
              <p className="text-xs text-ink-500">
                {post.author.sport} · {post.ago}
              </p>
            </div>
            <span className="ml-auto rounded-full border border-ink-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink-400">
              {post.kind}
            </span>
          </div>
          {post.highlight && (
            <p className="text-sm font-bold text-volt-400">
              {post.highlight.label}: {post.highlight.value}
            </p>
          )}
          <p className="text-sm text-ink-200 leading-relaxed">{post.text}</p>
          <div className="flex flex-wrap gap-2">
            {["🔥", "💪", "👏"].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => void react(post.id, emoji)}
                className="min-h-11 rounded-full border border-ink-800 bg-ink-950/50 px-2.5 py-1 text-xs hover:border-brand-400/40"
              >
                {emoji} {post.reactions[emoji] ?? 0}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-ink-500 pt-2 border-t border-ink-800">
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" aria-hidden />
              {Object.values(post.reactions).reduce((a, b) => a + b, 0)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              {post.comments}
            </span>
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-1 hover:text-ink-300"
              onClick={() => void share(post)}
            >
              <Share2 className="h-3.5 w-3.5" aria-hidden />
              Share
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-1 hover:text-eos-alert"
              onClick={() => void report(post.id)}
            >
              <Flag className="h-3.5 w-3.5" aria-hidden />
              Report
            </button>
          </div>
          <CommentsThread postId={post.id} />
        </PremiumCard>
      ))}
    </div>
  );
}

function CommentsThread({ postId }: { postId: string }) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/v1/community/posts/${encodeURIComponent(postId)}/comments`);
    if (res.status === 503) {
      setError("Comments are unavailable until persistence is configured.");
      setComments([]);
      setLoading(false);
      return;
    }
    if (!res.ok) {
      setError("Could not load comments.");
      setLoading(false);
      return;
    }
    const body = (await res.json()) as { comments: PostComment[] };
    setComments(body.comments);
    setLoading(false);
  }

  async function submit() {
    if (!draft.trim()) return;
    const res = await fetch(`/api/v1/community/posts/${encodeURIComponent(postId)}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: draft.trim() })
    });
    if (res.status === 401) {
      setError("Sign in to comment. Nothing was posted.");
      return;
    }
    if (res.status === 503) {
      setError("Comments are unavailable until persistence is configured.");
      return;
    }
    if (!res.ok) {
      setError("Comment failed. Nothing was posted.");
      return;
    }
    const body = (await res.json()) as { comment: PostComment };
    setComments((prev) => [...prev, body.comment]);
    setDraft("");
    setError(null);
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        className="min-h-11 text-xs uppercase tracking-wider text-eos-telemetry"
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) void load();
        }}
      >
        {open ? "Hide comments" : "Comments"}
      </button>
      {open ? (
        <div className="space-y-2">
          {loading ? <p className="text-xs text-ink-500">Loading comments…</p> : null}
          {error ? (
            <p className="text-xs text-eos-alert" role="alert">
              {error}
            </p>
          ) : null}
          {comments.map((comment) => (
            <p key={comment.id} className="text-sm text-ink-200">
              {comment.text}
            </p>
          ))}
          {!loading && !error && comments.length === 0 ? (
            <p className="text-xs text-ink-500">No comments yet.</p>
          ) : null}
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            placeholder="Write a comment…"
            className="w-full rounded-xl border border-ink-800 bg-ink-950/60 px-3 py-2 text-sm"
          />
          <Button type="button" size="sm" onClick={() => void submit()} disabled={!draft.trim()}>
            Comment
          </Button>
        </div>
      ) : null}
    </div>
  );
}
