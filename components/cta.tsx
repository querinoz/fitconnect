"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useT } from "@/lib/i18n-provider";

export function Cta() {
  const t = useT();
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="relative overflow-hidden rounded-3xl border border-brand-400/30 p-10 md:p-16 text-center bg-gradient-to-br from-brand-500/15 via-transparent to-accent-500/15">
        <div aria-hidden="true" className="absolute inset-0 bg-noise opacity-50" />
        <div
          aria-hidden="true"
          className="absolute -top-32 left-1/4 -z-10 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 right-1/4 -z-10 h-72 w-72 rounded-full bg-accent-500/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[420px] w-[420px] rounded-full bg-plasma-500/10 blur-3xl"
        />

        <span className="relative inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-200 ring-1 ring-brand-500/30">
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
