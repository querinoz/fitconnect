"use client";

import Link from "next/link";
import {
  BadgeCheck,
  Calendar,
  MapPin,
  MessageSquare,
  Star,
  Video
} from "lucide-react";
import { REVIEWS, type Trainer } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PremiumCard, RealtimeBadge } from "@/components/ui-glass/premium-system";
import {
  availabilityLabel,
  availabilityTone,
  getCoachAvailability
} from "@/lib/coach/availability";

type TrainerProfilePreviewProps = {
  trainer: Trainer;
  compact?: boolean;
};

/** Compact coach profile — used in discover side sheet. */
export function TrainerProfilePreview({ trainer, compact = false }: TrainerProfilePreviewProps) {
  const reviews = REVIEWS.filter((r) => r.trainerId === trainer.id).slice(0, 2);
  const availability = getCoachAvailability(trainer.id);

  return (
    <div className="space-y-5">
      <div className="relative aspect-[16/9] overflow-hidden fc-radius-card">
        <img src={trainer.cover} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end gap-3">
          <img
            src={trainer.avatar}
            alt={trainer.name}
            className="h-14 w-14 rounded-2xl ring-2 ring-ink-950 object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl font-bold text-ink-50">{trainer.name}</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-volt-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-volt-300 ring-1 ring-volt-500/30">
                <BadgeCheck className="h-3 w-3" /> Verified
              </span>
            </div>
            <p className="truncate text-sm text-ink-300">{trainer.headline}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <span className="inline-flex items-center gap-1.5 text-ink-300">
          <MapPin className="h-3.5 w-3.5 text-connect-500" />
          {trainer.city}, {trainer.country}
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
          <Star className="h-3.5 w-3.5 fill-current" />
          {trainer.rating.toFixed(1)} ({trainer.reviews})
        </span>
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${availabilityTone[availability]}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {availabilityLabel[availability]}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {trainer.sports.map((s) => (
          <span
            key={s}
            className="rounded-full border border-glass-border bg-glass-md px-2.5 py-0.5 text-xs font-medium text-ink-200"
          >
            {s}
          </span>
        ))}
      </div>

      {!compact && (
        <p className="text-sm leading-relaxed text-ink-300 line-clamp-4">{trainer.bio}</p>
      )}

      {reviews.length > 0 && (
        <PremiumCard className="space-y-3 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-500">
            Recent reviews
          </p>
          {reviews.map((r) => (
            <div key={r.id} className="border-t border-glass-border pt-3 first:border-0 first:pt-0">
              <p className="text-xs font-semibold text-ink-200">{r.author}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-400 line-clamp-2">{r.text}</p>
            </div>
          ))}
        </PremiumCard>
      )}

      <PremiumCard tone="brand" className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-ink-400">From</p>
            <p className="font-display text-3xl font-bold gradient-text">
              {formatPrice(trainer.hourlyRate)}
              <span className="text-sm font-normal text-ink-400">/h</span>
            </p>
          </div>
          <RealtimeBadge>Live</RealtimeBadge>
        </div>
        <div className="mt-4 grid gap-2">
          <Button className="w-full" size="lg">
            <Calendar className="h-4 w-4" /> Book session
          </Button>
          <Button className="w-full" variant="outline" size="lg">
            <Video className="h-4 w-4" /> Free 15-min intro
          </Button>
          <Button className="w-full" variant="ghost" size="sm">
            <MessageSquare className="h-4 w-4" /> Message
          </Button>
        </div>
      </PremiumCard>

      <Link
        href={`/trainer/${trainer.id}`}
        className="block text-center text-xs font-semibold text-volt-400 hover:text-volt-300"
      >
        View full profile →
      </Link>
    </div>
  );
}
