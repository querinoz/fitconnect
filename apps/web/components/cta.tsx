"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useT } from "@/lib/i18n-provider";

export function Cta() {
  const t = useT();
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="relative overflow-hidden rounded-3xl border border-volt-500/25 p-10 md:p-16 text-center bg-gradient-to-br from-volt-dim via-transparent to-connect-dim">
        <div aria-hidden="true" className="absolute inset-0 bg-noise opacity-50" />
        <div
          aria-hidden="true"
          className="absolute -top-32 left-1/4 -z-10 h-72 w-72 rounded-full bg-volt-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 right-1/4 -z-10 h-72 w-72 rounded-full bg-brand-400/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[420px] w-[420px] rounded-full bg-cyan-500/8 blur-3xl"
        />

        <span className="relative inline-flex items-center gap-1.5 rounded-full bg-volt-dim px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-volt-500 ring-1 ring-volt-500/25">
          <Sparkles aria-hidden="true" className="h-3 w-3" /> {t("cta", "pill")}
        </span>
        <h2 className="relative mt-5 font-display text-4xl md:text-6xl font-bold text-balance">
          {t("cta", "title1")}{" "}
          <span className="gradient-text">{t("cta", "titleAccent")}</span>
          <br />
          {t("cta", "title2")}
        </h2>
        <p className="relative mt-4 text-ink-300 text-lg max-w-2xl mx-auto">
          {t("cta", "subtitle")}
        </p>
        <div className="relative mt-8 flex flex-wrap gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/discover">
              {t("cta", "primary")}{" "}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/trainer">{t("cta", "secondary")}</Link>
          </Button>
        </div>
        <p className="relative mt-6 text-xs text-ink-500">
          {t("cta", "reassurance")}
        </p>
      </div>
    </section>
  );
}
