"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLocale, useT } from "@/lib/i18n-provider";
import { Brain, MessageSquare, Sparkles } from "lucide-react";
import {
  CalendarStreakIcon,
  CertificationIcon,
  DumbbellSetIcon,
  HeartRateIcon,
  RecoveryRingIcon,
  StopwatchIcon,
  TargetIcon,
  VideoRoomIcon
} from "@/components/brand/icons";
import { TiltCard } from "@/components/marketing/ck/tilt-card";

const ICONS = [
  CertificationIcon,
  VideoRoomIcon,
  CalendarStreakIcon,
  StopwatchIcon,
  HeartRateIcon,
  Brain,
  MessageSquare,
  RecoveryRingIcon,
  DumbbellSetIcon,
  TargetIcon,
  HeartRateIcon,
  Sparkles
];

const COLORS = [
  "text-volt-500 bg-volt-dim ring-volt-500/25",
  "text-brand-400 bg-connect-dim ring-brand-400/25",
  "text-cyan-500 bg-cyan-dim ring-cyan-500/25",
  "text-signal-400 bg-signal-500/10 ring-signal-500/30",
  "text-signal-400 bg-signal-500/10 ring-signal-500/30",
  "text-cyan-500 bg-cyan-dim ring-cyan-500/25",
  "text-brand-400 bg-connect-dim ring-brand-400/25",
  "text-volt-500 bg-volt-dim ring-volt-500/25",
  "text-amber-400 bg-amber-500/10 ring-amber-500/30",
  "text-volt-500 bg-volt-dim ring-volt-500/25",
  "text-signal-400 bg-signal-500/10 ring-signal-500/30",
  "text-cyan-500 bg-cyan-dim ring-cyan-500/25"
];

export function Features() {
  const t = useT();
  const locale = useLocale();
  const reduce = useReducedMotion();
  const items = locale.features.items;

  return (
    <section id="features" className="mx-auto max-w-7xl fc-section-x px-4 py-16 sm:px-6 sm:py-20 md:py-24">
      <div className="max-w-2xl">
        <p className="eyebrow">{t("features", "eyebrow")}</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold text-balance">
          {t("features", "title1")}{" "}
          <span className="gradient-text">{t("features", "titleAccent")}</span>
          {t("features", "titleAfter")}
        </h2>
        <p className="mt-4 text-ink-400 text-lg">{t("features", "subtitle")}</p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((it, i) => {
          const Icon = ICONS[i] ?? Sparkles;
          const color = COLORS[i] ?? COLORS[0];
          return (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: reduce ? 0 : 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: reduce ? 0 : 0.45, delay: reduce ? 0 : (i % 4) * 0.06 }}
            >
              <TiltCard className="h-full p-5">
                <div className={`grid h-11 w-11 place-items-center rounded-xl ring-1 ${color}`}>
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display font-semibold text-lg leading-snug">
                  {it.title}
                </h3>
                <p className="mt-2 text-sm text-ink-400 leading-relaxed">{it.body}</p>
              </TiltCard>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
