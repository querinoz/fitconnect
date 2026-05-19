"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight, Mail } from "lucide-react";
import { useT } from "@/lib/i18n-provider";

export function Cta() {
  const t = useT();
  return (
    <section id="contact" className="mx-auto max-w-7xl fc-section-x px-4 py-16 sm:px-6 sm:py-24 md:py-28">
      <div className="max-w-2xl mx-auto text-center">
        <p className="eyebrow">Contact</p>
        <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold text-balance leading-tight">
          {t("cta", "title1")}{" "}
          <span className="gradient-text">{t("cta", "titleAccent")}</span>
          <br />
          {t("cta", "title2")}
        </h2>
        <p className="mt-5 text-ink-400 text-lg max-w-xl mx-auto">
          {t("cta", "subtitle")}
        </p>
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/discover">
              {t("cta", "primary")}{" "}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/trainer">{t("cta", "secondary")}</Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link href="mailto:hello@fitconnect.app" className="gap-2">
              <Mail aria-hidden className="h-4 w-4" />
              Email us
            </Link>
          </Button>
        </div>
        <p className="mt-8 text-xs text-ink-500 font-mono">{t("cta", "reassurance")}</p>
      </div>
    </section>
  );
}
