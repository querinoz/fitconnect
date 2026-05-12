"use client";

import { useMemo, useState } from "react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Cta } from "@/components/cta";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { COMMUNITY_POSTS, SPORTS, type Sport } from "@/lib/data";
import {
  Award,
  Bookmark,
  Calendar,
  Heart,
  MessageCircle,
  Search,
  Share2,
  TrendingUp,
  Users
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const kinds = ["All", "PR", "Check-in", "Before/After", "Race", "Question"] as const;
type Kind = (typeof kinds)[number];

const sidebarStats = [
  { label: "Posts today", value: "2,184" },
  { label: "PRs logged this week", value: "12,604" },
  { label: "Active clubs", value: "412" }
];

const clubs = [
  { name: "Sub-3 marathon", members: 1842, sport: "Running" },
  { name: "Yoga moms of Lisbon", members: 412, sport: "Yoga" },
  { name: "Iberian sport climbers", members: 738, sport: "Climbing" },
  { name: "Open-water all-rounders", members: 311, sport: "Swimming" },
  { name: "Master strength 40+", members: 1284, sport: "Strength" }
];

const upcomingEvents = [
  { name: "Spring strength meet", date: "Apr 12 · Lisbon", attendees: 64 },
  { name: "Ericeira surf social", date: "Apr 19 · Ericeira", attendees: 38 },
  { name: "Innsbruck send weekend", date: "May 03 · Innsbruck", attendees: 71 }
];

export default function CommunityPage() {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<Kind>("All");
  const [sport, setSport] = useState<Sport | "All">("All");

  const filtered = useMemo(() => {
    return COMMUNITY_POSTS.filter((p) => {
      if (kind !== "All" && p.kind !== kind) return false;
      if (sport !== "All" && p.author.sport !== sport) return false;
      if (q && !p.text.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, kind, sport]);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> Community
            </p>
            <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold">
              The clubhouse, online.
            </h1>
            <p className="mt-2 text-ink-400 max-w-xl">
              Athletes celebrating PRs, asking real questions, posting before/afters.
              Specialist coaches drop in. No likes-economy nonsense.
            </p>
          </div>
          <Button size="lg">Share a check-in</Button>
        </header>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr_300px]">
          {/* Left sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-24 self-start">
            <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search the feed…"
                  className="w-full bg-ink-950/60 border border-ink-800 rounded-xl pl-9 pr-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/60"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5">
              <p className="text-xs uppercase tracking-widest text-ink-500 mb-3">
                Activity type
              </p>
              <div className="flex flex-wrap gap-1.5">
                {kinds.map((k) => (
                  <button
                    key={k}
                    onClick={() => setKind(k)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs border transition-colors",
                      kind === k
                        ? "border-brand-400/60 bg-brand-500/15 text-brand-100"
                        : "border-ink-800 bg-ink-950/40 text-ink-300 hover:border-ink-700"
                    )}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5">
              <p className="text-xs uppercase tracking-widest text-ink-500 mb-3">Sport</p>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setSport("All")}
                  className={cn(
                    "rounded-lg px-2.5 py-2 text-xs border",
                    sport === "All"
                      ? "border-brand-400/60 bg-brand-500/15 text-brand-100"
                      : "border-ink-800 bg-ink-950/40 text-ink-300"
                  )}
                >
                  All sports
                </button>
                {SPORTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSport(s)}
                    className={cn(
                      "rounded-lg px-2.5 py-2 text-xs border text-left",
                      sport === s
                        ? "border-brand-400/60 bg-brand-500/15 text-brand-100"
                        : "border-ink-800 bg-ink-950/40 text-ink-300"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Feed */}
          <section className="space-y-4">
            {filtered.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No posts here yet"
                description="Try widening your filters, or be the first one to post under this combination."
                cta={{ label: "Share a check-in", href: "/community" }}
              />
            ) : (
              filtered.map((p, i) => (
                <motion.article
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                  className="rounded-2xl border border-ink-800 bg-ink-900/40 p-6 hover:border-ink-700 transition-colors"
                >
                  <header className="flex items-start gap-3">
                    <img
                      src={p.author.avatar}
                      alt={p.author.name}
                      className="h-11 w-11 rounded-full ring-2 ring-ink-950"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink-100">
                        {p.author.name}{" "}
                        <span className="text-ink-500 font-normal text-sm">
                          · {p.author.sport} · {p.ago}
                        </span>
                      </p>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          p.kind === "PR" &&
                            "bg-accent-500/15 text-accent-300 ring-1 ring-accent-500/30",
                          p.kind === "Race" &&
                            "bg-signal-500/15 text-signal-300 ring-1 ring-signal-500/30",
                          p.kind === "Before/After" &&
                            "bg-plasma-500/15 text-plasma-300 ring-1 ring-plasma-500/30",
                          p.kind === "Check-in" &&
                            "bg-brand-500/15 text-brand-200 ring-1 ring-brand-500/30",
                          p.kind === "Question" &&
                            "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30"
                        )}
                      >
                        {p.kind === "PR" && <Award className="h-3 w-3" />}
                        {p.kind === "Race" && <TrendingUp className="h-3 w-3" />}
                        {p.kind}
                      </span>
                    </div>
                  </header>
                  <p className="mt-4 text-ink-200 leading-relaxed">{p.text}</p>
                  {p.imageUrl && (
                    <img
                      src={p.imageUrl}
                      alt=""
                      className="mt-4 w-full max-h-[420px] object-cover rounded-2xl border border-ink-800"
                    />
                  )}
                  {p.highlight && (
                    <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-accent-500/30 bg-accent-500/10 px-3 py-1.5">
                      <span className="text-[10px] uppercase tracking-widest text-accent-300">
                        {p.highlight.label}
                      </span>
                      <span className="font-display font-bold text-accent-200 tabular-nums">
                        {p.highlight.value}
                      </span>
                    </div>
                  )}
                  <footer className="mt-5 pt-4 border-t border-ink-800 flex items-center gap-6 text-sm text-ink-400">
                    <button className="flex items-center gap-1.5 hover:text-signal-400 transition-colors">
                      <Heart className="h-4 w-4" /> {p.likes}
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-brand-300 transition-colors">
                      <MessageCircle className="h-4 w-4" /> {p.comments}
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-ink-100 transition-colors ml-auto">
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-ink-100 transition-colors">
                      <Bookmark className="h-4 w-4" />
                    </button>
                  </footer>
                </motion.article>
              ))
            )}
          </section>

          {/* Right sidebar */}
          <aside className="hidden lg:block space-y-5 lg:sticky lg:top-24 self-start">
            <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5">
              <p className="text-xs uppercase tracking-widest text-ink-500 mb-3">
                Live activity
              </p>
              <div className="space-y-3">
                {sidebarStats.map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-sm text-ink-300">{s.label}</span>
                    <span className="font-display font-bold gradient-text tabular-nums">
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5">
              <p className="text-xs uppercase tracking-widest text-ink-500 mb-3">
                Trending clubs
              </p>
              <ul className="space-y-3">
                {clubs.map((c) => (
                  <li
                    key={c.name}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-100 truncate">
                        {c.name}
                      </p>
                      <p className="text-xs text-ink-500">
                        {c.sport} · {c.members.toLocaleString()} members
                      </p>
                    </div>
                    <button className="rounded-full bg-brand-500/10 border border-brand-500/30 px-3 py-1 text-xs text-brand-200 hover:bg-brand-500/20 transition-colors">
                      Join
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5">
              <p className="text-xs uppercase tracking-widest text-ink-500 mb-3">
                Upcoming meet-ups
              </p>
              <ul className="space-y-3">
                {upcomingEvents.map((e) => (
                  <li
                    key={e.name}
                    className="flex items-start gap-2.5 text-sm"
                  >
                    <Calendar className="h-4 w-4 text-brand-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-ink-100 truncate">{e.name}</p>
                      <p className="text-xs text-ink-500">
                        {e.date} · {e.attendees} going
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        <div className="mt-20">
          <Cta />
        </div>
      </main>
      <Footer />
    </>
  );
}
