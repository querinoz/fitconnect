"use client";

import { MapPin } from "lucide-react";
import Link from "next/link";
import { FEATURED_CITIES } from "@/lib/data";

export function CitiesStrip() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-14">
      <div className="rounded-3xl border border-ink-800 bg-ink-900/40 p-8 md:p-10">
        <div className="flex items-baseline flex-wrap gap-3 mb-5">
          <p className="eyebrow">Active in 47 countries</p>
          <p className="text-xs text-ink-500">· In-person + online globally</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FEATURED_CITIES.map((c) => (
            <Link
              key={c}
              href={`/discover?city=${encodeURIComponent(c)}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-ink-800 bg-ink-950/40 px-3.5 py-1.5 text-sm text-ink-200 hover:border-brand-400/40 hover:text-ink-50 transition-colors"
            >
              <MapPin className="h-3.5 w-3.5 text-brand-400" />
              {c}
            </Link>
          ))}
          <Link
            href="/discover"
            className="inline-flex items-center gap-1.5 rounded-full border border-brand-400/30 bg-brand-500/10 px-3.5 py-1.5 text-sm text-brand-200 hover:bg-brand-500/20 transition-colors font-semibold"
          >
            +43 more cities
          </Link>
        </div>
      </div>
    </section>
  );
}
