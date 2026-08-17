"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  Bike,
  Compass,
  Dumbbell,
  Flower2,
  Footprints,
  Sailboat,
  Snowflake,
  Trophy,
  Waves,
  type LucideIcon
} from "lucide-react";
import {
  SPORT_CATEGORIES,
  STRAVA_SPORT_TYPES,
  demoSportVolume,
  formatStravaSportLabel,
  sportSysCode,
  type StravaSportType
} from "@/lib/sports/strava-sports";
import {
  BentoCard,
  CornerTicks,
  EliteChip,
  LabelCaps,
  MetricDisplay
} from "@/components/elite-os";
import { formatMsg, useLocale } from "@/lib/i18n-provider";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  cycling: Bike,
  running: Footprints,
  swimming: Waves,
  winter: Snowflake,
  water: Sailboat,
  strength: Dumbbell,
  mind: Flower2,
  racket: Trophy,
  other: Compass
};

const FEATURED: StravaSportType[] = ["Ride", "Run", "Swim", "Yoga"];

const FEATURED_ICONS: Record<string, LucideIcon> = {
  Ride: Bike,
  Run: Footprints,
  Swim: Waves,
  Yoga: Flower2
};

type HubCopy = ReturnType<typeof useLocale>["landingV2"]["sportsHub"];
type CategoryId = (typeof SPORT_CATEGORIES)[number]["id"] | "all";

function categoryLabel(copy: HubCopy, id: string) {
  if (id in copy) return copy[id as keyof HubCopy];
  return id;
}

export function SportsHub() {
  const copy = useLocale().landingV2.sportsHub;
  const [filter, setFilter] = useState<CategoryId>("all");

  const visible = useMemo(
    () =>
      filter === "all"
        ? SPORT_CATEGORIES
        : SPORT_CATEGORIES.filter((cat) => cat.id === filter),
    [filter]
  );

  return (
    <section
      id="sports-hub"
      className="relative mx-auto w-full min-w-0 max-w-[1440px] overflow-x-clip px-4 py-16 sm:px-6 sm:py-24"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-2xl">
          <p className="eos-label-caps text-eos-voltline">{copy.eyebrow}</p>
          <h2 className="mt-3 max-w-full font-display text-[clamp(1.8rem,5vw,3.4rem)] font-extrabold leading-[0.92] tracking-tight text-eos-on-surface">
            {copy.title}{" "}
            <span className="text-eos-voltline">{copy.titleAccent}</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-eos-on-surface-muted sm:text-base">
            {formatMsg(copy.body, { count: STRAVA_SPORT_TYPES.length })}
          </p>
        </div>
        <div className="grid min-w-0 grid-cols-3 gap-3 sm:gap-4">
          <HeaderStat value={String(STRAVA_SPORT_TYPES.length)} unit={copy.types} accent />
          <HeaderStat
            value={String(SPORT_CATEGORIES.length).padStart(2, "0")}
            unit={copy.families}
          />
          <HeaderStat value={copy.demo} unit={copy.live} compact />
        </div>
      </div>

      {filter === "all" ? (
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {FEATURED.map((sport, index) => (
            <SportTile
              key={sport}
              sport={sport}
              copy={copy}
              featured
              lead={index === 0}
              index={index}
            />
          ))}
        </div>
      ) : null}

      <div
        className="mt-8 flex flex-wrap gap-2"
        role="tablist"
        aria-label={copy.eyebrow}
      >
        <EliteChip
          tone={filter === "all" ? "volt" : "neutral"}
          aria-pressed={filter === "all"}
          onClick={() => setFilter("all")}
        >
          {copy.all}
        </EliteChip>
        {SPORT_CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.id] ?? Compass;
          const active = filter === cat.id;
          return (
            <EliteChip
              key={cat.id}
              tone={active ? "volt" : "neutral"}
              aria-pressed={active}
              onClick={() => setFilter(cat.id)}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {categoryLabel(copy, cat.id)}
            </EliteChip>
          );
        })}
      </div>

      <div className="mt-10 space-y-8">
        {visible.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.id] ?? Compass;
          return (
            <section
              key={cat.id}
              className="min-w-0 rounded-[var(--eos-radius-card)] border border-eos-outline/80 bg-eos-carbon/40 p-4 sm:p-5"
            >
              <h3 className="mb-4 flex min-w-0 items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-eos-voltline/25 bg-eos-voltline/10 text-eos-voltline">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <LabelCaps className="truncate text-eos-on-surface">
                  {categoryLabel(copy, cat.id)}
                </LabelCaps>
                <span className="font-mono text-[10px] tabular-nums text-eos-on-surface-subtle">
                  {String(cat.sports.length).padStart(2, "0")}
                </span>
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                {cat.sports.map((sport, index) => (
                  <SportTile key={sport} sport={sport} copy={copy} index={index} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

function HeaderStat({
  value,
  unit,
  accent = false,
  compact = false
}: {
  value: string;
  unit: string;
  accent?: boolean;
  compact?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-[var(--eos-radius-nested)] border border-eos-outline bg-eos-carbon px-3 py-2.5">
      <p
        className={cn(
          "truncate font-mono font-medium tabular-nums tracking-tight",
          compact ? "text-[0.7rem] text-eos-telemetry sm:text-xs" : "eos-data-metric text-lg sm:text-xl",
          accent && "text-eos-voltline"
        )}
      >
        {value}
      </p>
      <p className="eos-label-caps mt-1 truncate">{unit}</p>
    </div>
  );
}

function SportTile({
  sport,
  copy,
  featured = false,
  lead = false,
  index = 0
}: {
  sport: StravaSportType;
  copy: HubCopy;
  featured?: boolean;
  lead?: boolean;
  index?: number;
}) {
  const volume = demoSportVolume(sport);
  const load = 28 + (volume % 62);
  const Icon = FEATURED_ICONS[sport];

  return (
    <BentoCard
      data-testid="sports-hub-card"
      elevation={featured ? "2" : "1"}
      interactive
      padding="sm"
      className={cn(
        "sports-hub-card group min-w-0",
        featured && "sports-hub-card--featured",
        lead && "ring-1 ring-eos-voltline/35"
      )}
      style={{ "--i": index } as CSSProperties}
    >
      <CornerTicks
        size={featured ? 12 : 8}
        opacity={featured ? 0.28 : 0.14}
        className="text-eos-voltline"
      />
      {featured ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-eos-voltline/10 blur-2xl transition group-hover:bg-eos-voltline/20"
        />
      ) : null}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-eos-voltline/55 to-transparent opacity-0 transition group-hover:opacity-100"
      />

      <div className="relative flex min-w-0 items-center justify-between gap-2">
        <p className="eos-label-caps truncate text-eos-on-surface-subtle">
          SYS.{sportSysCode(sport)}
        </p>
        {featured ? (
          <span className="flex items-center gap-1.5">
            <span className="sports-hub-live" />
            {Icon ? <Icon className="h-3.5 w-3.5 text-eos-voltline" aria-hidden /> : null}
          </span>
        ) : null}
      </div>

      <h4
        className={cn(
          "relative mt-2 min-w-0 truncate font-display font-bold tracking-tight text-eos-on-surface",
          featured ? "text-lg sm:text-xl" : "text-[0.95rem] leading-tight sm:text-base"
        )}
      >
        {formatStravaSportLabel(sport)}
      </h4>

      {featured ? (
        <MetricDisplay
          className="relative mt-4"
          value={<span className="text-eos-telemetry">{volume}</span>}
          unit={copy.today}
          delta={copy.logged}
        />
      ) : (
        <>
          <p className="relative mt-4 font-mono text-xs tabular-nums text-eos-telemetry">
            {volume} {copy.today}
          </p>
          <p className="relative mt-0.5 truncate text-[10px] uppercase tracking-[0.12em] text-eos-on-surface-subtle">
            {copy.logged}
          </p>
        </>
      )}

      <div className="sports-hub-load relative mt-3" aria-hidden>
        <span style={{ transform: `scaleX(${load / 100})` }} />
      </div>
    </BentoCard>
  );
}
