"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bookmark,
  MessageCircle,
  Share2,
  TrendingUp,
  Trophy,
  Activity,
  Users,
  HeartPulse,
  Camera,
  Sparkles,
  Zap
} from "lucide-react";
import type { DemoFeedPost } from "@/lib/demo/demo-feed";
import type { FitConnectReactionEmoji } from "@/lib/demo/feed-reactions";
import { cn } from "@/lib/utils";
import { FeedReactions } from "./feed-reactions";

const TYPE_STYLES: Record<
  DemoFeedPost["type"],
  { label: string; className: string; icon: typeof Activity }
> = {
  ACTIVITY: { label: "Activity", className: "bg-jade-500/15 text-jade-500", icon: Activity },
  PERFORMANCE: { label: "Performance", className: "bg-volt-500/15 text-volt-300", icon: TrendingUp },
  ACHIEVEMENT: { label: "Achievement", className: "bg-amber-400/15 text-amber-400", icon: Trophy },
  PERSONAL_BEST: { label: "Personal Best", className: "bg-volt-500/15 text-volt-300", icon: Trophy },
  RECOVERY: { label: "Recovery", className: "bg-jade-500/15 text-jade-500", icon: HeartPulse },
  COACH_INSIGHT: { label: "Coach Insight", className: "bg-jade-500/10 text-jade-500", icon: Sparkles },
  SQUAD: { label: "Squad", className: "bg-volt-500/10 text-volt-300", icon: Users },
  MILESTONE: { label: "Milestone", className: "bg-amber-400/15 text-amber-400", icon: Zap },
  PHOTO: { label: "Photo", className: "bg-glass-volt text-volt-300", icon: Camera },
  MOTIVATION: { label: "Motivation", className: "bg-glass-md text-ink-300", icon: Sparkles }
};

type FeedCardProps = {
  post: DemoFeedPost;
  index?: number;
  isNew?: boolean;
};

export function DemoFeedCard({ post, index = 0, isNew = false }: FeedCardProps) {
  const style = TYPE_STYLES[post.type];
  const Icon = style.icon;
  const [reactions, setReactions] = useState(post.reactions);
  const [userReaction, setUserReaction] = useState<FitConnectReactionEmoji | null>(null);
  const [saved, setSaved] = useState(false);

  const handleReact = (emoji: FitConnectReactionEmoji) => {
    setReactions((prev) => {
      const next = { ...prev };
      if (userReaction && userReaction !== emoji) {
        next[userReaction] = Math.max(0, (next[userReaction] ?? 1) - 1);
      }
      if (userReaction === emoji) {
        next[emoji] = Math.max(0, (next[emoji] ?? 1) - 1);
        setUserReaction(null);
      } else {
        next[emoji] = (next[emoji] ?? 0) + 1;
        setUserReaction(emoji);
      }
      return next;
    });
  };

  return (
    <motion.article
      layout
      initial={isNew ? { opacity: 0, y: -12, scale: 0.98 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.35,
        delay: isNew ? 0 : index * 0.03,
        type: "spring",
        stiffness: 380,
        damping: 28
      }}
      className="rounded-glass border border-glass-border bg-glass-md p-4"
      data-demo-feed-card
      data-event-id={post.eventId}
    >
      <header className="flex items-start gap-3">
        <motion.img
          initial={isNew ? { scale: 0.85, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: isNew ? 0.08 : 0 }}
          src={post.author.avatar}
          alt=""
          className="h-11 w-11 rounded-full border border-glass-border object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-sm text-ink-100 leading-tight">
                {post.author.name}
              </p>
              <p className="text-xs text-ink-500 mt-0.5">
                {post.author.sport} · {post.author.title}
              </p>
            </div>
            <span className="shrink-0 rounded border border-volt-500/30 bg-volt-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-volt-300">
              Demo
            </span>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1 mt-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              style.className
            )}
          >
            <Icon className="h-3 w-3" aria-hidden />
            {style.label}
          </span>
        </div>
      </header>

      <p className="mt-3 text-sm text-ink-200 leading-relaxed">{post.text}</p>

      {(post.highlight || post.metric) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {post.highlight && (
            <div className="rounded-xl border border-glass-border bg-glass-lo px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-500">
                {post.highlight.label}
              </p>
              <p className="font-mono text-lg font-bold text-ink-50 tabular-nums">
                {post.highlight.value}
              </p>
            </div>
          )}
          {post.metric && (
            <div className="rounded-xl border border-glass-border bg-glass-lo px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-500">
                {post.metric.label}
                {post.metric.zone && (
                  <span className="ml-2 text-jade-500">{post.metric.zone}</span>
                )}
              </p>
              <p className="font-mono text-lg font-bold text-ink-50 tabular-nums">
                {post.metric.value}
              </p>
            </div>
          )}
        </div>
      )}

      {post.imageUrl && (
        <motion.img
          initial={isNew ? { opacity: 0, y: 6 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: isNew ? 0.12 : 0 }}
          src={post.imageUrl}
          alt=""
          className="mt-3 w-full max-h-64 object-cover rounded-xl border border-glass-border"
        />
      )}

      <div className="mt-4">
        <FeedReactions
          counts={reactions}
          userReaction={userReaction}
          onReact={handleReact}
          compact
        />
      </div>

      <footer className="mt-3 pt-3 border-t border-glass-border flex items-center gap-4 text-xs text-ink-400">
        <button type="button" className="flex items-center gap-1 hover:text-volt-400 transition-colors">
          <MessageCircle className="h-3.5 w-3.5" /> {post.comments}
        </button>
        <button type="button" className="flex items-center gap-1 hover:text-ink-100 transition-colors">
          <Share2 className="h-3.5 w-3.5" />
          Share
        </button>
        <button
          type="button"
          onClick={() => setSaved((s) => !s)}
          className={cn(
            "ml-auto transition-colors",
            saved ? "text-volt-400" : "hover:text-ink-100"
          )}
          aria-pressed={saved}
        >
          <Bookmark className="h-3.5 w-3.5" />
        </button>
      </footer>
    </motion.article>
  );
}
