"use client";

import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale, useT } from "@/lib/i18n-provider";

export function Pricing() {
  const t = useT();
  const locale = useLocale();
  const reduce = useReducedMotion();
  const { features } = locale.pricing;

  const plans = [
    {
      key: "free" as const,
      name: t("pricing", "freeName"),
      price: "0",
      desc: t("pricing", "freeDesc"),
      features: features.free
    },
    {
      key: "athlete" as const,
      name: t("pricing", "athleteName"),
      price: "12",
      highlight: true,
      desc: t("pricing", "athleteDesc"),
      features: features.athlete
    },
    {
      key: "coach" as const,
      name: t("pricing", "coachName"),
      price: "29",
      desc: t("pricing", "coachDesc"),
      features: features.coach
    }
  ];

  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <p className="eyebrow">{t("pricing", "eyebrow")}</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold text-balance">
          {t("pricing", "title1")} <br />
          <span className="gradient-text">{t("pricing", "titleAccent")}</span>.
        </h2>
        <p className="mt-4 text-ink-400 text-lg">{t("pricing", "subtitle")}</p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3 items-stretch">
        {plans.map((p, i) => (
          <motion.div
            key={p.key}
            initial={{ opacity: 0, y: reduce ? 0 : 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : i * 0.08 }}
            className={`relative flex flex-col rounded-3xl border p-8 ${
              p.highlight
                ? "border-brand-400/60 bg-gradient-to-b from-brand-500/15 via-brand-500/5 to-transparent shadow-glow"
                : "border-ink-800 bg-ink-900/40"
            }`}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-brand-400 text-ink-950 px-3 py-0.5 text-xs font-bold">
                <Sparkles aria-hidden="true" className="h-3 w-3" />{" "}
                {t("pricing", "mostPopular")}
              </span>
            )}
            <h3 className="font-display text-2xl font-semibold">{p.name}</h3>
            <p className="text-ink-400 mt-1 text-sm min-h-[40px]">{p.desc}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-5xl font-bold font-display gradient-text">
                €{p.price}
              </span>
              <span className="text-ink-400">{t("pricing", "perMonth")}</span>
            </div>
            <ul className="mt-6 space-y-3 flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-ink-200">
                  <div className="mt-0.5 grid h-4 w-4 place-items-center rounded-full bg-accent-500/15 text-accent-400">
                    <Check aria-hidden="true" className="h-3 w-3" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
            <Button
              asChild
              className="mt-8 w-full"
              variant={p.highlight ? "default" : "outline"}
            >
              <Link href="/pricing">
                {t("pricing", "start")} {p.name}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 text-sm text-brand-300 hover:text-brand-200 font-semibold"
        >
          {t("pricing", "compareAll")}
        </Link>
      </div>
    </section>
  );
}
