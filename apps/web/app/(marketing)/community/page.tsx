"use client";

import { useMemo, useState } from "react";
import { Cta } from "@/components/cta";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CelebrationRibbon } from "@/components/celebration-ribbon";
import { CommunityFeed } from "@/components/community/community-feed";
import { CreatePostModal } from "@/components/community/create-post-modal";
import { CommunityActivityMap } from "@/components/community/community-activity-map";
import { COMMUNITY_POSTS, SPORTS, type Sport } from "@/lib/data";
import {
  dispatchCommunityPost,
  saveLocalPost
} from "@/lib/community/local-posts";
import { Calendar, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n-provider";
import {
  MetricTile,
  PremiumCard,
  RealtimeBadge,
  SectionHeader
} from "@/components/ui-glass/premium-system";

type FeedKind = keyof ReturnType<typeof useLocale>["communityFeed"]["kinds"];

const postKindKey: Record<string, Exclude<FeedKind, "all">> = {
  PR: "pr",
  "Check-in": "checkin",
  "Before/After": "beforeAfter",
  Race: "race",
  Question: "question"
};

const sidebarStatValues = ["2,184", "12,604", "412"];

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
  const locale = useLocale();
  const cf = locale.communityFeed;
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<FeedKind>("all");
  const [sport, setSport] = useState<Sport | "All">("All");
  const [createOpen, setCreateOpen] = useState(false);

  const kindKeys = Object.keys(cf.kinds) as FeedKind[];
  const sidebarStats = [
    { label: cf.stats.postsToday, value: sidebarStatValues[0] },
    { label: cf.stats.prsWeek, value: sidebarStatValues[1] },
    { label: cf.stats.activeClubs, value: sidebarStatValues[2] }
  ];

  const filtered = useMemo(() => {
    return COMMUNITY_POSTS.filter((p) => {
      if (kind !== "all" && postKindKey[p.kind] !== kind) return false;
      if (sport !== "All" && p.author.sport !== sport) return false;
      if (q && !p.text.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, kind, sport]);

  return (
    <main id="main" className="fc-marketing-hero fc-marketing-container pb-16">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <SectionHeader
          as="h1"
          eyebrow={cf.eyebrow}
          title={cf.title}
          body={cf.subtitle}
          action={<RealtimeBadge>Community live</RealtimeBadge>}
        />
        <Button size="lg" onClick={() => setCreateOpen(true)}>
          {cf.shareCta}
        </Button>
      </header>

      <CreatePostModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onPublish={(post) => {
          saveLocalPost(post);
          dispatchCommunityPost(post);
        }}
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {sidebarStats.map((stat) => (
          <MetricTile key={stat.label} label={stat.label} value={stat.value} tone="brand" />
        ))}
      </div>

      <CelebrationRibbon />

      <div className="mb-8">
        <CommunityActivityMap />
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr_300px]">
        <aside className="space-y-5 lg:sticky lg:top-24 self-start">
          <PremiumCard className="p-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={cf.searchPlaceholder}
                className="w-full bg-ink-950/60 border border-ink-800 rounded-xl pl-9 pr-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/60"
              />
            </div>
          </PremiumCard>

          <PremiumCard className="p-5">
            <p className="text-xs uppercase tracking-widest text-ink-500 mb-3">
              {cf.activityType}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {kindKeys.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs border transition-colors",
                    kind === k
                      ? "border-brand-400/60 bg-brand-500/15 text-brand-100"
                      : "border-ink-800 bg-ink-950/40 text-ink-300 hover:border-ink-700"
                  )}
                >
                  {cf.kinds[k]}
                </button>
              ))}
            </div>
          </PremiumCard>

          <PremiumCard className="p-5">
            <p className="text-xs uppercase tracking-widest text-ink-500 mb-3">{cf.sport}</p>
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
                {cf.allSports}
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
          </PremiumCard>
        </aside>

        <section className="space-y-4">
          {filtered.length === 0 ? (
            <EmptyState
              icon={Search}
              title={cf.emptyTitle}
              description={cf.emptyDesc}
              cta={{ label: cf.shareCta, href: "/community" }}
            />
          ) : (
            <CommunityFeed filteredIds={new Set(filtered.map((p) => p.id))} />
          )}
        </section>

        <aside className="hidden lg:block space-y-5 lg:sticky lg:top-24 self-start">
          <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5">
            <p className="text-xs uppercase tracking-widest text-ink-500 mb-3">
              {cf.liveActivity}
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
              {cf.trendingClubs}
            </p>
            <ul className="space-y-3">
              {clubs.map((c) => (
                <li key={c.name} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-100 truncate">{c.name}</p>
                    <p className="text-xs text-ink-500">
                      {c.sport} · {new Intl.NumberFormat().format(c.members)} {cf.members}
                    </p>
                  </div>
                  <button className="rounded-full bg-brand-500/10 border border-brand-500/30 px-3 py-1 text-xs text-brand-200 hover:bg-brand-500/20 transition-colors">
                    {cf.join}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5">
            <p className="text-xs uppercase tracking-widest text-ink-500 mb-3">
              {cf.upcomingMeetups}
            </p>
            <ul className="space-y-3">
              {upcomingEvents.map((e) => (
                <li key={e.name} className="flex items-start gap-2.5 text-sm">
                  <Calendar className="h-4 w-4 text-brand-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-ink-100 truncate">{e.name}</p>
                    <p className="text-xs text-ink-500">
                      {e.date} · {e.attendees} {cf.going}
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
  );
}
