"use client";

import { useMemo, useState } from "react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { TrainerCard } from "@/components/trainer-card";
import { SPORTS, TRAINERS, type Modality, type Sport } from "@/lib/data";
import { Search, SlidersHorizontal } from "lucide-react";

export default function DiscoverPage() {
  const [q, setQ] = useState("");
  const [sport, setSport] = useState<Sport | "all">("all");
  const [modality, setModality] = useState<Modality | "all">("all");
  const [maxPrice, setMaxPrice] = useState(100);

  const filtered = useMemo(() => {
    return TRAINERS.filter((t) => {
      if (q && !`${t.name} ${t.city} ${t.country} ${t.sports.join(" ")} ${t.headline}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (sport !== "all" && !t.sports.includes(sport)) return false;
      if (modality !== "all" && t.modality !== modality) return false;
      if (t.hourlyRate > maxPrice) return false;
      return true;
    });
  }, [q, sport, modality, maxPrice]);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="font-display text-4xl md:text-5xl font-bold">Find your trainer</h1>
        <p className="mt-2 text-ink-400">
          {filtered.length} specialists match your filters
        </p>

        <div className="mt-8 grid lg:grid-cols-[280px_1fr] gap-8">
          <aside className="space-y-6 rounded-2xl border border-ink-800 bg-ink-900/40 p-5 h-fit sticky top-24">
            <div>
              <label className="text-xs uppercase tracking-widest text-ink-500">
                Search
              </label>
              <div className="mt-2 relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Name, city, keyword..."
                  className="w-full bg-ink-950/60 border border-ink-800 rounded-xl pl-9 pr-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/60"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-ink-500">Sport</label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value as any)}
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
              <label className="text-xs uppercase tracking-widest text-ink-500">
                Modality
              </label>
              <div className="mt-2 grid grid-cols-3 gap-1">
                {(["all", "online", "in-person", "hybrid"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setModality(m as any)}
                    className={`px-2 h-9 rounded-lg text-xs border ${
                      modality === m
                        ? "bg-brand-400/20 border-brand-400/60 text-brand-200"
                        : "bg-ink-950/60 border-ink-800 text-ink-300"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-ink-500 flex items-center justify-between">
                Max price <span className="text-ink-200 font-semibold">€{maxPrice}/h</span>
              </label>
              <input
                type="range"
                min={20}
                max={120}
                step={5}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="mt-3 w-full accent-brand-400"
              />
            </div>

            <p className="text-xs text-ink-500 flex gap-2 items-center pt-2 border-t border-ink-800">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filters apply instantly
            </p>
          </aside>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center py-20 text-ink-400">
                No trainers match your filters yet — try widening your search.
              </div>
            ) : (
              filtered.map((t) => <TrainerCard key={t.id} t={t} />)
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
