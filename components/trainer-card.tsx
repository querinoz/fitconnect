"use client";

import Link from "next/link";
import { MapPin, Star, Clock, Video, Users, BadgeCheck } from "lucide-react";
import type { Trainer } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

export function TrainerCard({ t }: { t: Trainer }) {
  return (
    <Link
      href={`/trainer/${t.id}`}
      className="group relative rounded-2xl overflow-hidden border border-ink-800 bg-ink-900/40 hover:border-brand-400/60 transition-all hover:-translate-y-1 hover:shadow-elevated"
    >
      <div className="relative aspect-[5/3] overflow-hidden">
        <img
          src={t.cover}
          alt={t.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          {t.sports.slice(0, 2).map((s) => (
            <span
              key={s}
              className="rounded-full bg-ink-950/70 backdrop-blur px-2.5 py-0.5 text-xs font-medium text-ink-100"
            >
              {s}
            </span>
          ))}
        </div>
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-500/20 backdrop-blur px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-300 ring-1 ring-accent-500/40">
            <BadgeCheck className="h-3 w-3" /> Verified
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end gap-3">
          <img
            src={t.avatar}
            alt={t.name}
            className="h-12 w-12 rounded-full ring-2 ring-ink-950 object-cover"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-ink-50 truncate">{t.name}</h3>
            <p className="text-xs text-ink-300 truncate">{t.headline}</p>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-ink-300 truncate">
            <MapPin className="h-3.5 w-3.5 text-brand-400 shrink-0" />
            {t.city}, {t.country}
          </span>
          <span className="flex items-center gap-1 text-amber-400 font-semibold shrink-0">
            <Star className="h-3.5 w-3.5 fill-current" />
            {t.rating.toFixed(2)}
            <span className="text-ink-500 font-normal">({t.reviews})</span>
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-ink-400 pt-2 border-t border-ink-800/60">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {t.responseTime}
          </span>
          <span className="flex items-center gap-1">
            {t.modality === "online" ? (
              <>
                <Video className="h-3 w-3" /> Online
              </>
            ) : t.modality === "in-person" ? (
              <>
                <Users className="h-3 w-3" /> In-person
              </>
            ) : (
              <>
                <Video className="h-3 w-3" /> Hybrid
              </>
            )}
          </span>
          <span className="font-semibold text-ink-50 tabular-nums">
            {formatPrice(t.hourlyRate)}/h
          </span>
        </div>
      </div>
    </Link>
  );
}
