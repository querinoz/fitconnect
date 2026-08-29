"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  Bookmark,
  Heart,
  MessageCircle,
  Search,
  Share2,
  TrendingUp,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DemoFeedCard } from "@/components/community/demo-feed-card";
import { DemoFeedIndicator } from "@/components/community/demo-feed-indicator";
import { DEMO_FEED_MODE } from "@/lib/demo/constants";
import { useDemoLiveFeed } from "@/lib/demo/use-demo-live-feed";
import { COMMUNITY_POSTS, SPORTS, type Sport } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n-provider";

type FeedKind = keyof ReturnType<typeof useLocale>["communityFeed"]["kinds"];

const postKindKey: Record<string, Exclude<FeedKind, "all">> = {
  PR: "pr",
  "Check-in": "checkin",
  "Before/After": "beforeAfter",
  Race: "race",
  Question: "question"
};

export function CommunityFeed({ compact = false }: { compact?: boolean }) {
  const locale = useLocale();
  const cf = locale.communityFeed;
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<FeedKind>("all");
  const [sport, setSport] = useState<Sport | "All">("All");

  const { posts: demoPosts, isLive, demoMode } = useDemoLiveFeed({
    enabled: DEMO_FEED_MODE && compact
  });

  const [newestId, setNewestId] = useState<string | null>(null);
  const prevFirstId = useRef<string | null>(null);

  useEffect(() => {
    const first = demoPosts[0]?.id ?? null;
    if (first && first !== prevFirstId.current) {
      prevFirstId.current = first;
      setNewestId(first);
    }
  }, [demoPosts]);

  const kindKeys = Object.keys(cf.kinds) as FeedKind[];

  const filtered = useMemo(() => {
    return COMMUNITY_POSTS.filter((p) => {
      if (kind !== "all" && postKindKey[p.kind] !== kind) return false;
      if (sport !== "All" && p.author.sport !== sport) return false;
      if (q && !p.text.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, kind, sport]);

  const showDemoFeed = demoMode && compact;

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      {!compact && (
        <header className="mb-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500 inline-flex items-center gap-1.5">
            <Users aria-hidden className="h-3.5 w-3.5" /> {cf.eyebrow}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">{cf.title}</h1>
          <p className="mt-1 text-sm text-ink-400">{cf.subtitle}</p>
        </header>
      )}

      {showDemoFeed && <DemoFeedIndicator isLive={isLive} />}

      {!showDemoFeed && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 hide-scrollbar">
            {kindKeys.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs border transition-colors",
                  kind === k
                    ? "border-volt-500/50 bg-glass-volt text-volt-300"
                    : "border-glass-border bg-glass-md text-ink-400"
                )}
              >
                {cf.kinds[k]}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={cf.searchPlaceholder}
              className="w-full bg-glass-md border border-glass-border rounded-xl pl-9 pr-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-volt-500/40"
            />
          </div>
        </>
      )}

      <section className="space-y-3">
        {showDemoFeed ? (
          demoPosts.map((post, i) => (
            <DemoFeedCard
              key={post.id}
              post={post}
              index={i}
              isNew={i === 0 && post.id === newestId}
            />
          ))
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title={cf.emptyTitle}
            description={cf.emptyDesc}
            cta={{ label: cf.shareCta, href: "/feed" }}
          />
        ) : (
          filtered.map((p, i) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className="rounded-glass border border-glass-border bg-glass-md p-4"
            >
              <header className="flex items-start gap-3">
                <img
                  src={p.author.avatar}
                  alt={p.author.name}
                  className="h-10 w-10 rounded-full border border-glass-border object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-ink-100">
                    {p.author.name}
                    <span className="text-ink-500 font-normal">
                      {" "}
                      · {p.author.sport}
                    </span>
                  </p>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      p.kind === "PR" && "bg-volt-500/15 text-volt-300",
                      p.kind === "Race" && "bg-coral-500/15 text-coral-500",
                      p.kind === "Check-in" && "bg-jade-500/15 text-jade-500"
                    )}
                  >
                    {p.kind === "PR" && <Award className="h-3 w-3" />}
                    {p.kind === "Race" && <TrendingUp className="h-3 w-3" />}
                    {cf.kinds[postKindKey[p.kind] ?? "checkin"]}
                  </span>
                </div>
              </header>
              <p className="mt-3 text-sm text-ink-200 leading-relaxed">{p.text}</p>
              {p.imageUrl && (
                <img
                  src={p.imageUrl}
                  alt=""
                  className="mt-3 w-full max-h-64 object-cover rounded-xl border border-glass-border"
                />
              )}
              <footer className="mt-4 pt-3 border-t border-glass-border flex items-center gap-4 text-xs text-ink-400">
                <button type="button" className="flex items-center gap-1 hover:text-coral-500">
                  <Heart className="h-3.5 w-3.5" /> {p.likes}
                </button>
                <button type="button" className="flex items-center gap-1 hover:text-volt-400">
                  <MessageCircle className="h-3.5 w-3.5" /> {p.comments}
                </button>
                <button type="button" className="ml-auto hover:text-ink-100">
                  <Share2 className="h-3.5 w-3.5" />
                </button>
                <button type="button" className="hover:text-ink-100">
                  <Bookmark className="h-3.5 w-3.5" />
                </button>
              </footer>
            </motion.article>
          ))
        )}
      </section>

      {!compact && (
        <Button className="w-full" variant="outline">
          {cf.shareCta}
        </Button>
      )}
    </div>
  );
}
