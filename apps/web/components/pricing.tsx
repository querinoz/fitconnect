"use client";

import { useState } from "react";
import { ArrowRight, Bolt, Check, Terminal } from "lucide-react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useLocale, useT } from "@/lib/i18n-provider";
import { BentoCard } from "@/components/elite-os/bento-card";
import { LabelCaps } from "@/components/elite-os/typography";
import { cn } from "@/lib/utils";

export function Pricing() {
  const t = useT();
  const locale = useLocale();
  const reduce = useReducedMotion();
  const { features } = locale.pricing;
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      key: "athlete" as const,
      name: "Athlete OS",
      price: annual ? 39 : 49,
      desc: "For individual high-performance tracking.",
      features: features.athlete,
      highlight: true,
      icon: Bolt
    },
    {
      key: "coach" as const,
      name: "Coach OS",
      price: annual ? 159 : 199,
      desc: "Squad-level telemetry & ROI management.",
      features: features.coach,
      highlight: false,
      icon: Terminal
    }
  ];

  return (
    <section id="pricing" className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-block rounded-full border border-eos-voltline/20 bg-eos-voltline/10 px-4 py-1 eos-label-caps text-eos-voltline">
          PRO LEVEL UNLOCKED
        </span>
        <h2 className="mt-6 font-display text-4xl font-black tracking-tighter text-eos-on-surface md:text-5xl">
          UNLOCK ELITE
          <br />
          PERFORMANCE
        </h2>
        <p className="mt-4 text-lg text-eos-on-surface-muted">{t("pricing", "subtitle")}</p>

        <div className="mt-8 flex items-center justify-center gap-4 eos-label-caps">
          <span className={cn(!annual && "text-eos-on-surface-muted")}>MONTHLY</span>
          <button
            type="button"
            role="switch"
            aria-checked={annual}
            onClick={() => setAnnual((v) => !v)}
            className="relative h-8 w-16 rounded-full border border-eos-surface-container-high bg-eos-surface-container transition-colors"
          >
            <span
              className={cn(
                "absolute top-1 h-6 w-6 rounded-full bg-eos-voltline shadow-[0_0_10px_rgba(200,255,0,0.5)] transition-transform",
                annual ? "translate-x-8" : "translate-x-1"
              )}
            />
          </button>
          <span className={cn("flex items-center gap-2", annual ? "text-eos-on-surface" : "text-eos-on-surface-muted")}>
            ANNUAL
            <span className="rounded bg-eos-voltline px-2 py-0.5 text-[10px] font-bold text-[#070b14]">
              SAVE 20%
            </span>
          </span>
        </div>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {plans.map((p, i) => (
          <motion.div
            key={p.key}
            initial={{ opacity: 0, y: reduce ? 0 : 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : i * 0.08 }}
          >
            <BentoCard
              elevation={p.highlight ? "glass" : "1"}
              interactive
              className={cn(
                "flex h-full flex-col p-8 transition hover:-translate-y-1",
                p.highlight && "border-eos-voltline/30 shadow-[0_0_40px_-10px_rgba(200,255,0,0.3)]"
              )}
            >
              {p.highlight ? (
                <span className="absolute -top-3 right-8 inline-flex items-center gap-1 rounded-full bg-eos-voltline px-4 py-1.5 eos-label-caps text-[10px] text-[#070b14] shadow-[0_0_20px_rgba(200,255,0,0.4)]">
                  <Bolt className="h-3.5 w-3.5" aria-hidden />
                  AI RECOMMENDED
                </span>
              ) : null}
              <div className="mb-6 flex items-center gap-2">
                <p.icon className={cn("h-5 w-5", p.highlight ? "text-eos-voltline" : "text-eos-iris")} />
                <h3 className="font-display text-2xl font-semibold text-eos-on-surface">{p.name}</h3>
              </div>
              <p className="text-sm text-eos-on-surface-muted">{p.desc}</p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-5xl font-bold text-eos-on-surface">${p.price}</span>
                <LabelCaps className="opacity-60">/MONTH</LabelCaps>
              </div>
              <Link
                href="/pricing"
                className={cn(
                  "mt-8 block w-full rounded-[18px] py-4 text-center eos-label-caps transition active:scale-95",
                  p.highlight
                    ? "bg-eos-voltline text-[#070b14] hover:shadow-[0_0_20px_rgba(200,255,0,0.4)]"
                    : "border border-eos-iris/40 bg-eos-surface-container text-eos-on-surface hover:border-eos-iris hover:bg-eos-iris/10"
                )}
              >
                {p.highlight ? "ACTIVATE ATHLETE OS" : "DEPLOY COACH OS"}
              </Link>
              <ul className="mt-8 flex-1 space-y-4">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-eos-on-surface-muted">
                    <Check
                      className={cn("mt-0.5 h-4 w-4 shrink-0", p.highlight ? "text-eos-voltline" : "text-eos-iris")}
                      aria-hidden
                    />
                    {f}
                  </li>
                ))}
              </ul>
            </BentoCard>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 text-sm font-semibold text-eos-voltline hover:text-eos-voltline/80"
        >
          {t("pricing", "compareAll")}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
