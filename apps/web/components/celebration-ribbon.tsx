"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Award, Flame, Sparkles, Trophy, UserPlus2 } from "lucide-react";
import { useT } from "@/lib/i18n-provider";
import { cn } from "@/lib/utils";

type Kind = "pr" | "hire" | "streak" | "booking";

interface Celebration {
  id: string;
  kind: Kind;
  athlete: string;
  avatar: string;
  detail: string;
  metric: { label: string; value: string };
  city: string;
  ago: string;
  coach?: string;
}

const seed: Celebration[] = [
  {
    id: "cel-1",
    kind: "pr",
    athlete: "Inês P.",
    avatar: "https://i.pravatar.cc/120?img=45",
    detail: "Back-squat",
    metric: { label: "PR", value: "145 kg" },
    city: "Lisbon",
    ago: "12m",
    coach: "Tomás Reyes"
  },
  {
    id: "cel-2",
    kind: "pr",
    athlete: "Aoife C.",
    avatar: "https://i.pravatar.cc/120?img=33",
    detail: "Berlin Marathon",
    metric: { label: "PB", value: "2:54:08" },
    city: "Dublin",
    ago: "1h",
    coach: "Diego Almeida"
  },
  {
    id: "cel-3",
    kind: "streak",
    athlete: "Daniel R.",
    avatar: "https://i.pravatar.cc/120?img=11",
    detail: "Foundations · daily",
    metric: { label: "Streak", value: "41 days" },
    city: "Porto",
    ago: "2h"
  },
  {
    id: "cel-4",
    kind: "hire",
    athlete: "Luca M.",
    avatar: "https://i.pravatar.cc/120?img=22",
    detail: "Started with",
    metric: { label: "Coach", value: "Hana Okafor" },
    city: "Ericeira",
    ago: "3h",
    coach: "Hana Okafor"
  },
  {
    id: "cel-5",
    kind: "pr",
    athlete: "Pedro M.",
    avatar: "https://i.pravatar.cc/120?img=68",
    detail: "20-min FTP test",
    metric: { label: "FTP", value: "312 W" },
    city: "Girona",
    ago: "5h",
    coach: "Mateo Rinaldi"
  },
  {
    id: "cel-6",
    kind: "booking",
    athlete: "Yusuf H.",
    avatar: "https://i.pravatar.cc/120?img=60",
    detail: "First open-water session",
    metric: { label: "Distance", value: "1.4 km" },
    city: "Nice",
    ago: "8h",
    coach: "Sophie Laurent"
  }
];

const tones: Record<
  Kind,
  { ring: string; chip: string; icon: typeof Award }
> = {
  pr: {
    ring: "ring-accent-500/40",
    chip: "bg-accent-500/15 text-accent-300 ring-accent-500/30",
    icon: Trophy
  },
  hire: {
    ring: "ring-brand-400/40",
    chip: "bg-brand-500/15 text-brand-200 ring-brand-500/30",
    icon: UserPlus2
  },
  streak: {
    ring: "ring-signal-500/40",
    chip: "bg-signal-500/15 text-signal-300 ring-signal-500/30",
    icon: Flame
  },
  booking: {
    ring: "ring-plasma-500/40",
    chip: "bg-plasma-500/15 text-plasma-300 ring-plasma-500/30",
    icon: Award
  }
};

export function CelebrationRibbon() {
  const t = useT();
  const reduce = useReducedMotion();

  return (
    <section
      aria-label={t("community", "celebrationsHeading")}
      className="mb-8 rounded-3xl border border-ink-800 bg-gradient-to-br from-ink-900/60 via-ink-900/30 to-ink-950/60 p-5 md:p-6"
    >
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div>
          <p className="eyebrow inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            {t("community", "celebrationsHeading")}
          </p>
          <p className="mt-1 text-sm text-ink-400 max-w-xl">
            {t("community", "celebrationsSub")}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-500/10 text-accent-300 px-3 py-1 text-xs font-semibold ring-1 ring-accent-500/30">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-accent-400/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-400" />
          </span>
          live
        </span>
      </div>
      <div className="-mx-2 overflow-x-auto hide-scrollbar mask-fade-x">
        <ul className="flex gap-3 px-2 pb-1">
          {seed.map((c, i) => (
            <CelebrationCard key={c.id} c={c} index={i} reduce={!!reduce} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function CelebrationCard({
  c,
  index,
  reduce
}: {
  c: Celebration;
  index: number;
  reduce: boolean;
}) {
  const t = useT();
  const tone = tones[c.kind];
  const Icon = tone.icon;
  const chipLabel = {
    pr: t("community", "chip").pr,
    hire: t("community", "chip").hire,
    streak: t("community", "chip").streak,
    booking: t("community", "chip").booking
  }[c.kind];

  return (
    <motion.li
      initial={{ opacity: 0, y: reduce ? 0 : 14, scale: reduce ? 1 : 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: reduce ? 0 : 0.45, delay: index * 0.06 }}
      className={cn(
        "relative shrink-0 w-[280px] overflow-hidden rounded-2xl border border-ink-800 bg-ink-950/80 p-4 ring-1",
        tone.ring
      )}
    >
      {!reduce && <Confetti delay={0.15 + index * 0.06} />}
      <div className="relative flex items-center gap-3">
        <div className="relative">
          <img
            src={c.avatar}
            alt=""
            className="h-11 w-11 rounded-full ring-2 ring-ink-950 object-cover"
          />
          <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-ink-950 ring-1 ring-ink-800">
            <Icon className={cn("h-3 w-3", tone.chip.split(" ")[1])} />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink-50 text-sm truncate">
            {c.athlete}
          </p>
          <p className="text-[11px] text-ink-500 truncate">
            {c.city} · {c.ago}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1",
            tone.chip
          )}
        >
          {chipLabel}
        </span>
      </div>

      <p className="relative mt-3 text-xs text-ink-400">{c.detail}</p>
      <div className="relative mt-2 flex items-baseline justify-between gap-2">
        <span className="text-[10px] uppercase tracking-widest text-ink-500">
          {c.metric.label}
        </span>
        <span className="font-display text-xl font-bold gradient-text tabular-nums">
          {c.metric.value}
        </span>
      </div>
      {c.coach && (
        <p className="relative mt-2 pt-2 border-t border-ink-800 text-[10px] text-ink-500">
          with {c.coach}
        </p>
      )}
    </motion.li>
  );
}

function Confetti({ delay }: { delay: number }) {
  const palette = ["#22d3ee", "#84cc16", "#a855f7", "#f43f5e", "#fde047"];
  const bits = Array.from({ length: 9 }, (_, i) => i);
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {bits.map((i) => {
        const angle = (i / bits.length) * Math.PI * 2;
        const dist = 40 + Math.random() * 26;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist - 12;
        const color = palette[i % palette.length];
        return (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
            whileInView={{
              x,
              y,
              opacity: [0, 1, 0],
              scale: [0.6, 1, 0.6],
              rotate: [0, 180, 360]
            }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.9,
              delay,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="absolute left-12 top-6 h-1.5 w-1.5 rounded-sm"
            style={{ background: color }}
          />
        );
      })}
    </div>
  );
}
