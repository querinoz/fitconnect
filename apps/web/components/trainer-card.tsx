"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";
import {
  BadgeCheck,
  Clock,
  MapPin,
  Sparkles,
  Star,
  Users,
  Video,
  Zap
} from "lucide-react";
import type { Trainer } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { useT } from "@/lib/i18n-provider";
import { cn } from "@/lib/utils";
import { FitMeModal } from "./fit-me-modal";
import { BentoCard } from "@/components/elite-os/bento-card";
import { aiMatchScore } from "@/lib/coach/ai-match-score";
import {
  availabilityLabel,
  availabilityTone,
  getCoachAvailability
} from "@/lib/coach/availability";

type TrainerCardProps = {
  t: Trainer;
  layout?: "default" | "featured" | "compact";
};

export function TrainerCard({ t: trainer, layout = "default" }: TrainerCardProps) {
  const t = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const availability = getCoachAvailability(trainer.id);
  const isFeatured = layout === "featured";
  const matchPct = aiMatchScore(trainer.id);

  function openFitMe(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  }

  function openProfile(e: MouseEvent<HTMLElement>) {
    e.preventDefault();
    router.push(`/trainer/${trainer.id}`);
  }

  return (
    <>
      <BentoCard
        interactive
        elevation={isFeatured ? "glass" : "1"}
        padding="none"
        onClick={openProfile}
        className={cn(
          "group flex cursor-pointer flex-col overflow-hidden",
          isFeatured &&
            "border-eos-voltline/25 shadow-[0_0_40px_-12px_rgba(200,255,0,0.25)] md:col-span-2 md:row-span-2"
        )}
      >
        <div className={cn("relative overflow-hidden", isFeatured ? "aspect-[16/10]" : "aspect-[5/3]")}>
          <img
            src={trainer.cover}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-eos-floor via-eos-floor/25 to-transparent" />
          <div className="absolute left-3 top-3 flex gap-2">
            {trainer.sports.slice(0, isFeatured ? 3 : 2).map((s) => (
              <span
                key={s}
                className="rounded-full border border-white/10 bg-eos-floor/70 px-2.5 py-0.5 text-xs font-medium text-ink-100 backdrop-blur"
              >
                {s}
              </span>
            ))}
          </div>
          <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-eos-voltline/30 bg-eos-voltline/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-eos-voltline backdrop-blur">
              <Sparkles className="h-3 w-3" aria-hidden />
              AI {matchPct}% match
            </span>
            {trainer.featured ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-volt-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-volt-300 ring-1 ring-volt-500/40 backdrop-blur">
                Featured
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1 rounded-full bg-connect-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-connect-500 ring-1 ring-connect-500/30 backdrop-blur">
              <BadgeCheck className="h-3 w-3" /> Verified
            </span>
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-end gap-3">
            <img
              src={trainer.avatar}
              alt={trainer.name}
              className={cn(
                "rounded-2xl object-cover ring-2 ring-eos-floor",
                isFeatured ? "h-16 w-16" : "h-12 w-12"
              )}
            />
            <div className="min-w-0 flex-1">
              <h3 className={cn("truncate font-semibold text-ink-50", isFeatured && "text-lg")}>
                {trainer.name}
              </h3>
              <p className="truncate text-xs text-ink-300">{trainer.headline}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex min-w-0 items-center gap-1.5 truncate text-ink-300">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-connect-500" />
              {trainer.city}, {trainer.country}
            </span>
            <span className="flex shrink-0 items-center gap-1 font-semibold text-amber-400">
              <Star className="h-3.5 w-3.5 fill-current" />
              {trainer.rating.toFixed(2)}
            </span>
          </div>

          {isFeatured ? (
            <p className="line-clamp-2 text-sm leading-relaxed text-ink-400">{trainer.bio}</p>
          ) : null}

          <div className="flex items-center justify-between border-t border-eos-outline pt-2 text-xs text-ink-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {trainer.responseTime}
            </span>
            <span className="flex items-center gap-1">
              {trainer.modality === "online" ? (
                <>
                  <Video className="h-3 w-3" /> Online
                </>
              ) : trainer.modality === "in-person" ? (
                <>
                  <Users className="h-3 w-3" /> In-person
                </>
              ) : (
                <>
                  <Video className="h-3 w-3" /> Hybrid
                </>
              )}
            </span>
            <span className="font-semibold tabular-nums text-ink-50">
              {formatPrice(trainer.hourlyRate)}/h
            </span>
          </div>

          <p className={`flex items-center gap-2 text-xs font-medium ${availabilityTone[availability]}`}>
            <span className="h-2 w-2 rounded-full bg-current" />
            {availabilityLabel[availability]}
          </p>

          <div className="mt-auto flex gap-2">
            <Link
              href={`/trainer/${trainer.id}#book-intro`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 rounded-2xl border border-connect-500/30 bg-connect-500/10 py-2 text-center text-xs font-semibold text-connect-500 hover:bg-connect-500/15"
            >
              Free intro
            </Link>
            <button
              type="button"
              onClick={openFitMe}
              className="flex flex-1 items-center justify-center gap-1 rounded-2xl bg-eos-voltline py-2 text-xs font-bold text-eos-floor hover:shadow-[0_0_15px_rgba(200,255,0,0.35)]"
            >
              <Zap className="h-3.5 w-3.5" />
              {t("fitme", "cta")}
            </button>
          </div>
        </div>
      </BentoCard>

      <FitMeModal trainer={trainer} open={open} onOpenChange={setOpen} />
    </>
  );
}
