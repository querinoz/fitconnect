"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TrainerCard } from "@/components/trainer-card";
import { TrainerCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Atmosphere } from "@/components/marketing/atmosphere";
import { SPORTS, TRAINERS, type Modality, type Sport } from "@/lib/data";
import {
  ArrowRight,
  Filter,
  MapPin,
  Search,
  SlidersHorizontal,
  X
} from "lucide-react";
import { formatMsg, useT } from "@/lib/i18n-provider";
import { PremiumCard, RealtimeBadge, SectionHeader } from "@/components/ui-glass/premium-system";
import {
  FilterChip,
  FilterToggle,
  PremiumInput,
  PremiumSelect
} from "@/components/ui-glass/form-system";

type SortKey = "best-match" | "rating" | "price-asc" | "price-desc" | "newest";
type LevelFilter = "all" | "Beginner" | "Intermediate" | "Advanced";

const PAGE_SIZE = 9;

export default function DiscoverPage() {
  return (
    <Suspense fallback={<DiscoverFallback />}>
      <DiscoverInner />
    </Suspense>
  );
}

function DiscoverFallback() {
  return (
    <main id="main" className="fc-marketing-hero fc-marketing-container pb-16">
      <div className="h-10 w-72 skeleton mb-4" />
      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        <div className="h-[320px] fc-radius-card skeleton" />
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <TrainerCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}

function DiscoverInner() {
  const t = useT();
  const search = useSearchParams();
  const initialSport = (search.get("sport") as Sport) ?? "all";

  const sortLabels: Record<SortKey, string> = {
    "best-match": t("discover", "sortBest"),
    rating: t("discover", "sortRating"),
    "price-asc": t("discover", "sortPriceAsc"),
    "price-desc": t("discover", "sortPriceDesc"),
    newest: "Newest"
  };

  const [q, setQ] = useState("");
  const [sport, setSport] = useState<Sport | "all">(initialSport);
  const [modality, setModality] = useState<Modality | "all">("all");
  const [maxPrice, setMaxPrice] = useState(120);
  const [minYears, setMinYears] = useState(0);
  const [sort, setSort] = useState<SortKey>("best-match");
  const [loading, setLoading] = useState(true);
  const [minRating, setMinRating] = useState(0);
  const [city, setCity] = useState("");
  const [level, setLevel] = useState<LevelFilter>("all");
  const [page, setPage] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setPage(0);
  }, [q, sport, modality, maxPrice, minYears, sort, minRating, city, level]);

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(id);
  }, []);

  const filtered = useMemo(() => {
    const list = TRAINERS.filter((t) => {
      if (
        q &&
        !`${t.name} ${t.city} ${t.country} ${t.sports.join(" ")} ${t.headline}`
          .toLowerCase()
          .includes(q.toLowerCase())
      )
        return false;
      if (sport !== "all" && !t.sports.includes(sport)) return false;
      if (modality !== "all" && t.modality !== modality) return false;
      if (t.hourlyRate > maxPrice) return false;
      if (t.years < minYears) return false;
      if (t.rating < minRating) return false;
      if (city && !`${t.city} ${t.country}`.toLowerCase().includes(city.toLowerCase()))
        return false;
      if (level !== "all") {
        const lvl =
          t.years >= 10 ? "Advanced" : t.years >= 5 ? "Intermediate" : "Beginner";
        if (lvl !== level) return false;
      }
      return true;
    });

    switch (sort) {
      case "rating":
        return list.sort((a, b) => b.rating - a.rating);
      case "price-asc":
        return list.sort((a, b) => a.hourlyRate - b.hourlyRate);
      case "price-desc":
        return list.sort((a, b) => b.hourlyRate - a.hourlyRate);
      case "newest":
        return list.sort((a, b) => b.reviews - a.reviews);
      default:
        return list.sort((a, b) => {
          const af = a.featured ? 1 : 0;
          const bf = b.featured ? 1 : 0;
          if (bf !== af) return bf - af;
          return b.rating - a.rating;
        });
    }
  }, [q, sport, modality, maxPrice, minYears, sort, minRating, city, level]);

  const paged = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const hasActiveFilters =
    sport !== "all" ||
    modality !== "all" ||
    maxPrice < 120 ||
    minYears > 0 ||
    minRating > 0 ||
    city ||
    level !== "all" ||
    q;

  function resetFilters() {
    setQ("");
    setSport("all");
    setModality("all");
    setMaxPrice(120);
    setMinYears(0);
    setMinRating(0);
    setCity("");
    setLevel("all");
  }

  const sportChips = (
    <div className="flex flex-wrap gap-1.5">
      <FilterChip active={sport === "all"} onClick={() => setSport("all")}>
        {t("discover", "allSports")}
      </FilterChip>
      {SPORTS.map((s) => (
        <FilterChip key={s} active={sport === s} onClick={() => setSport(s)}>
          {s}
        </FilterChip>
      ))}
    </div>
  );

  const Sidebar = (
    <aside className="space-y-5">
      <div>
        <label className="text-xs uppercase tracking-widest text-ink-500">
          {t("discover", "search")}
        </label>
        <div className="mt-2">
          <PremiumInput
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("discover", "searchPlaceholder")}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest text-ink-500">
          {t("discover", "sport")}
        </label>
        <div className="mt-2">{sportChips}</div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest text-ink-500">
          Level
        </label>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {(["all", "Beginner", "Intermediate", "Advanced"] as const).map((lv) => (
            <FilterToggle
              key={lv}
              active={level === lv}
              onClick={() => setLevel(lv === "all" ? "all" : lv)}
            >
              {lv === "all" ? "All levels" : lv}
            </FilterToggle>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest text-ink-500">
          Location
        </label>
        <PremiumInput
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City or country"
          className="mt-2"
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest text-ink-500 flex items-center justify-between">
          Min rating{" "}
          <span className="text-ink-100 font-semibold">{minRating.toFixed(1)}+</span>
        </label>
        <input
          type="range"
          min={0}
          max={5}
          step={0.5}
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
          className="mt-3 w-full accent-brand-400"
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest text-ink-500">
          {t("discover", "modality")}
        </label>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {(["all", "online", "in-person", "hybrid"] as const).map((m) => (
            <FilterToggle key={m} active={modality === m} onClick={() => setModality(m)}>
              {m === "all" ? t("discover", "anyModality") : m}
            </FilterToggle>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest text-ink-500 flex items-center justify-between">
          {t("discover", "maxPrice")}{" "}
          <span className="text-ink-100 font-semibold">€{maxPrice}/h</span>
        </label>
        <input
          type="range"
          min={20}
          max={150}
          step={5}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="mt-3 w-full accent-brand-400"
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest text-ink-500 flex items-center justify-between">
          {t("discover", "minExperience")}{" "}
          <span className="text-ink-100 font-semibold">{minYears} yrs</span>
        </label>
        <input
          type="range"
          min={0}
          max={15}
          step={1}
          value={minYears}
          onChange={(e) => setMinYears(Number(e.target.value))}
          className="mt-3 w-full accent-brand-400"
        />
      </div>

      <button
        type="button"
        onClick={resetFilters}
        className="w-full text-xs text-ink-400 hover:text-ink-100 flex items-center justify-center gap-2 pt-3 border-t border-ink-800"
      >
        <X className="h-3.5 w-3.5" /> {t("discover", "resetFilters")}
      </button>

      <p className="text-xs text-ink-500 flex gap-2 items-center pt-2 border-t border-ink-800">
        <SlidersHorizontal className="h-3.5 w-3.5" /> {t("discover", "filtersInstant")}
      </p>
    </aside>
  );

  return (
    <main id="main" className="fc-marketing-hero fc-marketing-container pb-16">
      <div className="relative isolate mb-4 pb-6">
        <div className="pointer-events-none absolute inset-x-0 -top-12 bottom-0 -z-10 overflow-hidden [mask-image:linear-gradient(to_bottom,black,transparent_85%)]">
          <Atmosphere bandsOnly />
        </div>
        <header className="mb-2 flex flex-wrap items-end justify-between gap-4">
          <SectionHeader
            as="h1"
            className="fc-vt-hero"
            title={
              sport === "all"
                ? t("discover", "titleAll")
                : formatMsg(t("discover", "titleSport"), { sport })
            }
            body={
              loading
                ? t("discover", "loading")
                : formatMsg(t("discover", "matchCount"), {
                    count: filtered.length
                  })
            }
            action={<RealtimeBadge>Live map</RealtimeBadge>}
          />
          <div className="flex shrink-0 items-center gap-2">
            <PremiumSelect value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
              {Object.entries(sortLabels).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </PremiumSelect>
            <button
              onClick={() => setDrawerOpen(true)}
              className="inline-flex h-11 items-center gap-1.5 rounded-2xl border border-glass-border bg-glass-md px-3 text-sm lg:hidden"
            >
              <Filter className="h-4 w-4" /> {t("discover", "filters")}
            </button>
          </div>
        </header>
      </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap mb-6 mt-2">
            {sport !== "all" && (
              <FilterPill
                label={sport}
                onClear={() => setSport("all")}
              />
            )}
            {modality !== "all" && (
              <FilterPill
                label={modality}
                onClear={() => setModality("all")}
              />
            )}
            {maxPrice < 120 && (
              <FilterPill
                label={formatMsg(t("discover", "upToPrice"), { price: maxPrice })}
                onClear={() => setMaxPrice(120)}
              />
            )}
            {minYears > 0 && (
              <FilterPill
                label={formatMsg(t("discover", "yearsPlus"), { years: minYears })}
                onClear={() => setMinYears(0)}
              />
            )}
            {q && <FilterPill label={`"${q}"`} onClear={() => setQ("")} />}
          </div>
        )}

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          <PremiumCard className="hidden lg:block h-fit sticky top-24 p-5">
            {Sidebar}
          </PremiumCard>

          {/* Mobile drawer */}
          {drawerOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-ink-950/80 backdrop-blur-xl"
                onClick={() => setDrawerOpen(false)}
              />
              <div className="absolute bottom-0 right-0 top-0 w-[min(320px,92vw)] overflow-y-auto border-l border-glass-border bg-glass-ink p-5 backdrop-blur-glass">
                <div className="flex items-center justify-between mb-5">
                  <p className="font-semibold">{t("discover", "filters")}</p>
                  <button onClick={() => setDrawerOpen(false)}>
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {Sidebar}
              </div>
            </div>
          )}

          <div>
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <TrainerCardSkeleton key={i} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={Search}
                title={t("discover", "emptyTitle")}
                description={t("discover", "emptyDesc")}
                cta={{ label: t("discover", "resetFilters"), href: "/discover" }}
              />
            ) : (
              <>
                <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {paged.map((trainer, idx) => (
                    <TrainerCard
                      key={trainer.id}
                      t={trainer}
                      layout={
                        idx === 0 && trainer.featured
                          ? "featured"
                          : "default"
                      }
                    />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      disabled={page === 0}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      className="rounded-xl border border-ink-800 px-4 py-2 text-sm disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-ink-400">
                      Page {page + 1} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-xl border border-ink-800 px-4 py-2 text-sm disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
                <div className="mt-12 fc-radius-card border border-glass-border bg-glass-md p-8 text-center backdrop-blur-glass">
                  <MapPin className="mx-auto h-6 w-6 text-volt-400" />
                  <h3 className="mt-3 font-display text-xl font-bold">
                    {t("discover", "handPairTitle")}
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-ink-400">
                    {t("discover", "handPairBody")}
                  </p>
                  <Button asChild className="mt-5">
                    <a href="mailto:match@fitconnect.app">
                      {t("discover", "handPairCta")}{" "}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
  );
}

function FilterPill({ label, onClear }: { label: string; onClear: () => void }) {
  const t = useT();
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-volt-500/35 bg-volt-500/10 px-3 py-1 text-xs font-medium text-volt-300">
      {label}
      <button
        onClick={onClear}
        aria-label={t("common", "removeFilter")}
        className="grid h-4 w-4 place-items-center rounded-full hover:bg-brand-500/30"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
