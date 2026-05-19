"use client";

import { useCallback, useEffect, useState } from "react";
import type { CommunityPost, Sport } from "@/lib/data";
import { COMMUNITY_POSTS } from "@/lib/data";
import {
  communityPostEventName,
  loadLocalPosts
} from "@/lib/community/local-posts";
import { useChannel } from "@/lib/realtime/use-channel";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui-glass/premium-system";
import { cn } from "@/lib/utils";
import { Heart, MessageCircle, Share2 } from "lucide-react";

type FeedPost = CommunityPost & { reactions: Record<string, number> };

function seedPosts(): FeedPost[] {
  const local = typeof window !== "undefined" ? loadLocalPosts() : [];
  const merged = [...local, ...COMMUNITY_POSTS];
  return merged.map((p) => ({
    ...p,
    reactions: { "🔥": Math.max(1, p.likes % 7), "💪": p.likes % 5, "👏": p.comments }
  }));
}

export function CommunityFeed({
  filteredIds
}: {
  filteredIds: Set<string> | null;
}) {
  const [posts, setPosts] = useState<FeedPost[]>(seedPosts);
  const [draft, setDraft] = useState("");
  const [kind, setKind] = useState<CommunityPost["kind"]>("Check-in");
  const { messages, send } = useChannel("community:feed");

  useEffect(() => {
    function onExternalPost(e: Event) {
      const post = (e as CustomEvent<CommunityPost>).detail;
      if (!post) return;
      setPosts((prev) => {
        if (prev.some((p) => p.id === post.id)) return prev;
        return [
          {
            ...post,
            reactions: { "🔥": 1 }
          },
          ...prev
        ];
      });
    }
    window.addEventListener(communityPostEventName(), onExternalPost);
    return () => window.removeEventListener(communityPostEventName(), onExternalPost);
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
          reactions: { "🔥": 1 }
        },
        ...prev
      ];
    });
  }, [messages]);

  const visible = filteredIds
    ? posts.filter(
        (p) => filteredIds.has(p.id) || p.id.startsWith("c-local-")
      )
    : posts;

  const publish = useCallback(() => {
    if (!draft.trim()) return;
    const post = {
      kind: "community-post" as const,
      id: `c-local-${Date.now()}`,
      author: {
        name: "You",
        avatar: "https://i.pravatar.cc/200?img=8",
        sport: "Running"
      },
      postKind: kind,
      text: draft.trim(),
      at: new Date().toISOString()
    };
    send(post);
    setPosts((prev) => [
      {
        id: post.id,
        author: {
          name: post.author.name,
          avatar: post.author.avatar,
          sport: post.author.sport as Sport
        },
        kind: post.postKind,
        text: post.text,
        likes: 0,
        comments: 0,
        ago: "just now",
        reactions: { "🔥": 1 }
      },
      ...prev
    ]);
    setDraft("");
  }, [draft, kind, send]);

  function react(postId: string, emoji: string) {
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
  }

  return (
    <div className="space-y-6">
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
        <Button type="button" size="sm" onClick={publish} disabled={!draft.trim()}>
          Post to feed
        </Button>
        <p className="text-[10px] text-ink-500">
          Live sync via BroadcastChannel (demo realtime).
        </p>
      </PremiumCard>

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
                onClick={() => react(post.id, emoji)}
                className="rounded-full border border-ink-800 bg-ink-950/50 px-2.5 py-1 text-xs hover:border-brand-400/40"
              >
                {emoji} {post.reactions[emoji] ?? 0}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-ink-500 pt-2 border-t border-ink-800">
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" aria-hidden />
              {post.likes + Object.values(post.reactions).reduce((a, b) => a + b, 0)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              {post.comments}
            </span>
            <button type="button" className="inline-flex items-center gap-1 hover:text-ink-300">
              <Share2 className="h-3.5 w-3.5" aria-hidden />
              Share
            </button>
          </div>
        </PremiumCard>
      ))}
    </div>
  );
}
