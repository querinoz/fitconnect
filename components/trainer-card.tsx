"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import {
  BadgeCheck,
  Clock,
  MapPin,
  Star,
  Users,
  Video,
  Zap
} from "lucide-react";
import type { Trainer } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { useT } from "@/lib/i18n-provider";
import { FitMeModal } from "./fit-me-modal";

export function TrainerCard({ t: trainer }: { t: Trainer }) {
  const t = useT();
  const [open, setOpen] = useState(false);

  function openFitMe(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  }

  return (
    <>
      <Link
        href={`/trainer/${trainer.id}`}
        className="group relative flex flex-col rounded-2xl overflow-hidden border border-ink-800 bg-ink-900/40 hover:border-brand-400/60 transition-all hover:-translate-y-1 hover:shadow-elevated"
      >
        <div className="relative aspect-[5/3] overflow-hidden">
          <img
            src={trainer.cover}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            {trainer.sports.slice(0, 2).map((s) => (
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
              <BadgeCheck aria-hidden="true" className="h-3 w-3" /> Verified
            </span>
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-end gap-3">
            <img
              src={trainer.avatar}
              alt={trainer.name}
              className="h-12 w-12 rounded-full ring-2 ring-ink-950 object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-ink-50 truncate">
                {trainer.name}
              </h3>
              <p className="text-xs text-ink-300 truncate">{trainer.headline}</p>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-ink-300 truncate">
              <MapPin
                aria-hidden="true"
                className="h-3.5 w-3.5 text-brand-400 shrink-0"
              />
              {trainer.city}, {trainer.country}
            </span>
            <span className="flex items-center gap-1 text-amber-400 font-semibold shrink-0">
              <Star aria-hidden="true" className="h-3.5 w-3.5 fill-current" />
              {trainer.rating.toFixed(2)}
              <span className="text-ink-500 font-normal">
                ({trainer.reviews})
              </span>
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-ink-400 pt-2 border-t border-ink-800/60">
            <span className="flex items-center gap-1">
              <Clock aria-hidden="true" className="h-3 w-3" />{" "}
              {trainer.responseTime}
            </span>
            <span className="flex items-center gap-1">
              {trainer.modality === "online" ? (
                <>
                  <Video aria-hidden="true" className="h-3 w-3" /> Online
                </>
              ) : trainer.modality === "in-person" ? (
                <>
                  <Users aria-hidden="true" className="h-3 w-3" /> In-person
                </>
              ) : (
                <>
                  <Video aria-hidden="true" className="h-3 w-3" /> Hybrid
                </>
              )}
            </span>
            <span className="font-semibold text-ink-50 tabular-nums">
              {formatPrice(trainer.hourlyRate)}/h
            </span>
          </div>

          <button
            type="button"
            onClick={openFitMe}
            aria-label={`${t("fitme", "cta")} ${trainer.name}`}
            className="group/cta relative flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 text-ink-950 font-bold text-sm py-2.5 shadow-lg shadow-brand-500/15 transition-all hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/80"
          >
            <Zap
              aria-hidden="true"
              className="h-3.5 w-3.5 transition-transform group-hover/cta:rotate-12"
            />
            {t("fitme", "cta")}
            <span className="ml-1 text-[10px] font-semibold uppercase tracking-wider text-ink-950/70">
              · 1 tap
            </span>
          </button>
        </div>
      </Link>

      <FitMeModal trainer={trainer} open={open} onOpenChange={setOpen} />
    </>
  );
}
