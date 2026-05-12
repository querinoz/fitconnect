"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { TrainerCard } from "@/components/trainer-card";
import { TrainerCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { DemoBanner } from "@/components/demo-banner";
import { SPORTS, TRAINERS, type Modality, type Sport } from "@/lib/data";
import {
  ArrowRight,
  Filter,
  MapPin,
  Search,
  SlidersHorizontal,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

type SortKey = "best-match" | "rating" | "price-asc" | "price-desc";

const sortLabels: Record<SortKey, string> = {
  "best-match": "Best match",
  rating: "Highest rated",
  "price-asc": "Price · low to high",
  "price-desc": "Price · high to low"
};

export default function DiscoverPage() {
  return (
    <Suspense fallback={<DiscoverFallback />}>
      <DiscoverInner />
    </Suspense>
  );
}

function DiscoverFallback() {
  return (
    <>
      <DemoBanner />
      <Nav />
      <main id="main" className="mx-auto max-w-7xl px-6 py-10">
        <div className="h-10 w-72 skeleton mb-4" />
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          <div className="h-[320px] rounded-2xl skeleton" />
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <TrainerCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function DiscoverInner() {
  const search = useSearchParams();
  const initialSport = (search.get("sport") as Sport) ?? "all";

  const [q, setQ] = useState("");
  const [sport, setSport] = useState<Sport | "all">(initialSport);
  const [modality, setModality] = useState<Modality | "all">("all");
  const [maxPrice, setMaxPrice] = useState(120);
  const [minYears, setMinYears] = useState(0);
  const [sort, setSort] = useState<SortKey>("best-match");
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
      return true;
    });

    switch (sort) {
      case "rating":
        return list.sort((a, b) => b.rating - a.rating);
      case "price-asc":
        return list.sort((a, b) => a.hourlyRate - b.hourlyRate);
      case "price-desc":
        return list.sort((a, b) => b.hourlyRate - a.hourlyRate);
      default:
        return list;
    }
  }, [q, sport, modality, maxPrice, minYears, sort]);

  const hasActiveFilters =
    sport !== "all" || modality !== "all" || maxPrice < 120 || minYears > 0 || q;

  function resetFilters() {
    setQ("");
    setSport("all");
    setModality("all");
    setMaxPrice(120);
    setMinYears(0);
  }

  const Sidebar = (
    <aside className="space-y-5">
      <div>
        <label className="text-xs uppercase tracking-widest text-ink-500">
          Search
        </label>
        <div className="mt-2 relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, city, keyword…"
            className="w-full bg-ink-950/60 border border-ink-800 rounded-xl pl-9 pr-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/60"
          />
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest text-ink-500">Sport</label>
        <select
          value={sport}
          onChange={(e) => setSport(e.target.value as Sport | "all")}
          className="mt-2 w-full bg-ink-950/60 border border-ink-800 rounded-xl px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/60"
        >
          <option value="all">All sports</option>
          {SPORTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest text-ink-500">Modality</label>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {(["all", "online", "in-person", "hybrid"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setModality(m)}
              className={cn(
                "px-2 h-9 rounded-lg text-xs border capitalize",
                modality === m
                  ? "bg-brand-400/15 border-brand-400/60 text-brand-100"
                  : "bg-ink-950/60 border-ink-800 text-ink-300"
              )}
            >
              {m === "all" ? "Any" : m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest text-ink-500 flex items-center justify-between">
          Max price <span className="text-ink-100 font-semibold">€{maxPrice}/h</span>
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
          Min experience{" "}
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
        <X className="h-3.5 w-3.5" /> Reset filters
      </button>

      <p className="text-xs text-ink-500 flex gap-2 items-center pt-2 border-t border-ink-800">
        <SlidersHorizontal className="h-3.5 w-3.5" /> Filters apply instantly
      </p>
    </aside>
  );

  return (
    <>
      <DemoBanner />
      <Nav />
      <main id="main" className="mx-auto max-w-7xl px-6 py-10">
        <header className="flex flex-wrap items-end justify-between gap-4 mb-2">
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-bold">
              {sport === "all" ? "Find your specialist" : `${sport} specialists`}
            </h1>
            <p className="mt-2 text-ink-400">
              {loading
                ? "Loading 12,418 verified coaches…"
                : `${filtered.length} of 12,418 specialists match your filters`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="bg-ink-900/60 border border-ink-800 rounded-xl px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/60"
            >
              {Object.entries(sortLabels).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 rounded-xl border border-ink-800 bg-ink-900/60 h-10 px-3 text-sm"
            >
              <Filter className="h-4 w-4" /> Filters
            </button>
          </div>
        </header>

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
                label={`Up to €${maxPrice}/h`}
                onClear={() => setMaxPrice(120)}
              />
            )}
            {minYears > 0 && (
              <FilterPill
                label={`${minYears}+ years`}
                onClear={() => setMinYears(0)}
              />
            )}
            {q && <FilterPill label={`"${q}"`} onClear={() => setQ("")} />}
          </div>
        )}

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          <aside className="hidden lg:block rounded-2xl border border-ink-800 bg-ink-900/40 p-5 h-fit sticky top-24">
            {Sidebar}
          </aside>

          {/* Mobile drawer */}
          {drawerOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-ink-950/80 backdrop-blur"
                onClick={() => setDrawerOpen(false)}
              />
              <div className="absolute right-0 top-0 bottom-0 w-[300px] bg-ink-900 border-l border-ink-800 p-5 overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                  <p className="font-semibold">Filters</p>
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
                title="No specialists match those filters"
                description="Try a higher price ceiling, a different sport, or remove the modality constraint."
                cta={{ label: "Reset filters", href: "/discover" }}
              />
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((t) => (
                    <TrainerCard key={t.id} t={t} />
                  ))}
                </div>
                <div className="mt-12 rounded-3xl border border-ink-800 bg-ink-900/40 p-8 text-center">
                  <MapPin className="h-6 w-6 text-brand-400 mx-auto" />
                  <h3 className="mt-3 font-display text-xl font-bold">
                    Looking for someone specific?
                  </h3>
                  <p className="mt-2 text-sm text-ink-400 max-w-md mx-auto">
                    Our Coach Match team will hand-pair you with up to three specialists in 24
                    hours. Free, no obligation.
                  </p>
                  <Button asChild className="mt-5">
                    <a href="mailto:match@fitconnect.app">
                      Request a hand-pair <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function FilterPill({
  label,
  onClear
}: {
  label: string;
  onClear: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-400/40 bg-brand-500/10 text-brand-100 px-3 py-1 text-xs font-medium">
      {label}
      <button
        onClick={onClear}
        aria-label="remove filter"
        className="grid h-4 w-4 place-items-center rounded-full hover:bg-brand-500/30"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
