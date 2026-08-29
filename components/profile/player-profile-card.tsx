"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Flame, Shield, Star } from "lucide-react";
import { DEMO_PROFILE, type BadgeRarity } from "@/lib/demo/demo-gamification";
import { cn } from "@/lib/utils";

const RARITY_STYLES: Record<BadgeRarity, string> = {
  COMMON: "border-ink-600 text-ink-300",
  RARE: "border-jade-500/40 text-jade-500",
  EPIC: "border-amber-400/40 text-amber-400",
  ELITE: "border-volt-500/50 text-volt-300",
  LEGENDARY: "border-coral-500/50 text-coral-500"
};

export function PlayerProfileCard({
  name = "You",
  avatarUrl = "/icons/icon-192.png"
}: {
  name?: string;
  avatarUrl?: string;
}) {
  const profile = DEMO_PROFILE;
  const xpPct = Math.round((profile.xp / profile.xpToNext) * 100);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-glass border border-glass-border bg-glass-md">
        <div
          className="h-28 bg-cover bg-center opacity-60"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&auto=format&fit=crop&q=80)"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
        <div className="relative px-5 pb-5 -mt-10">
          <img
            src={avatarUrl}
            alt=""
            className="h-20 w-20 rounded-2xl border-2 border-ink-950 object-cover shadow-lg"
          />
          <div className="mt-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">
                Performance Identity
              </p>
              <h1 className="font-display text-2xl font-bold text-ink-50">{name}</h1>
              <p className="text-sm text-volt-300 font-semibold">{profile.title}</p>
            </div>
            <span className="rounded border border-volt-500/30 bg-volt-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-volt-300">
              Demo
            </span>
          </div>
          <p className="mt-2 text-sm italic text-ink-400">&ldquo;{profile.quote}&rdquo;</p>
        </div>
      </div>

      <section className="rounded-glass border border-glass-border bg-glass-md p-5 space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">
              Level {profile.level}
            </p>
            <p className="font-mono text-2xl font-bold text-ink-50 tabular-nums">
              {profile.xp.toLocaleString()}
              <span className="text-sm text-ink-500 font-normal">
                {" "}
                / {profile.xpToNext.toLocaleString()} XP
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">
              Next
            </p>
            <p className="font-display text-lg font-bold text-volt-300">
              Lvl {profile.level + 1}
            </p>
          </div>
        </div>
        <div className="h-2 rounded-full bg-ink-800 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-grad-pulse"
            initial={{ width: 0 }}
            animate={{ width: `${xpPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-ink-400">
          <span className="inline-flex items-center gap-1">
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            {profile.streak} day streak
          </span>
          <span className="inline-flex items-center gap-1">
            <Shield className="h-3.5 w-3.5 text-volt-400" />
            {profile.squad}
          </span>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {profile.stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-glass-border bg-glass-lo p-3 text-center"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink-500">
              {s.label}
            </p>
            <p className="mt-1 font-mono text-lg font-bold text-ink-50 tabular-nums">
              {s.value}
            </p>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink-50">Featured Badges</h2>
          <p className="text-xs text-ink-500 font-mono tabular-nums">
            {profile.badgesUnlocked} / {profile.badgesTotal}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {profile.featuredBadges.map((badge) => (
            <div
              key={badge.id}
              className={cn(
                "rounded-xl border bg-glass-lo p-4",
                RARITY_STYLES[badge.rarity],
                !badge.earned && "opacity-60"
              )}
            >
              <Star className="h-5 w-5 mb-2" aria-hidden />
              <p className="font-semibold text-sm text-ink-100">{badge.name}</p>
              <p className="mt-1 text-xs text-ink-500">{badge.description}</p>
              {badge.progress && (
                <p className="mt-2 text-[10px] font-mono text-ink-400">
                  {badge.progress.current} / {badge.progress.target}
                </p>
              )}
              <p className="mt-2 text-[10px] font-bold uppercase tracking-wider opacity-80">
                {badge.rarity}
              </p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-center">
        <Link
          href="/settings/appearance"
          className="text-sm font-semibold text-volt-500 hover:text-volt-400"
        >
          Appearance and theme →
        </Link>
      </p>
    </div>
  );
}
