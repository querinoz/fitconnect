"use client";

import Link from "next/link";
import { Dumbbell, Github, Instagram, Twitter, Youtube } from "lucide-react";
import { useT } from "@/lib/i18n-provider";

export function Footer() {
  const t = useT();

  const product = [
    { label: t("nav", "findCoach"), href: "/discover" },
    { label: t("nav", "programs"), href: "/programs" },
    { label: t("nav", "dashboard"), href: "/dashboard" },
    { label: t("nav", "community"), href: "/community" },
    { label: t("nav", "methodology"), href: "/methodology" },
    { label: t("nav", "pricing"), href: "/pricing" }
  ];

  const company = [
    { label: t("nav", "forCoaches"), href: "/trainer" },
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
    { label: "Partnerships", href: "#" }
  ];

  const legal = [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Trust & Safety", href: "#" },
    { label: "Contact", href: "#" }
  ];

  const social = [
    { label: "Instagram", icon: Instagram, href: "#" },
    { label: "Twitter", icon: Twitter, href: "#" },
    { label: "YouTube", icon: Youtube, href: "#" },
    {
      label: "GitHub",
      icon: Github,
      href: "https://github.com/querinoz/fitconnect"
    }
  ];

  return (
    <footer className="border-t border-ink-800/80 mt-24 bg-ink-950">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-display font-bold"
            aria-label="FitConnect — home"
          >
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 text-ink-950">
              <Dumbbell aria-hidden="true" className="h-5 w-5" />
            </div>
            FitConnect
          </Link>
          <p className="mt-4 text-sm text-ink-400 max-w-xs leading-relaxed">
            {t("footer", "tagline")}
          </p>
          <div className="mt-6 flex gap-2">
            {social.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="grid h-9 w-9 place-items-center rounded-lg border border-ink-800 text-ink-400 hover:text-ink-100 hover:border-brand-400/40 transition-colors"
              >
                <s.icon aria-hidden="true" className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-semibold mb-3 text-ink-100 text-sm">
            {t("footer", "productHeading")}
          </h4>
          <ul className="space-y-2 text-sm text-ink-400">
            {product.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="hover:text-ink-100 transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-semibold mb-3 text-ink-100 text-sm">
            {t("footer", "companyHeading")}
          </h4>
          <ul className="space-y-2 text-sm text-ink-400">
            {company.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="hover:text-ink-100 transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-semibold mb-3 text-ink-100 text-sm">
            {t("footer", "legalHeading")}
          </h4>
          <ul className="space-y-2 text-sm text-ink-400">
            {legal.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="hover:text-ink-100 transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-semibold mb-3 text-ink-100 text-sm">
            {t("footer", "buildHeading")}
          </h4>
          <p className="text-sm text-ink-400 leading-relaxed">
            {t("footer", "buildBody")}
          </p>
          <Link
            href="https://github.com/querinoz/fitconnect"
            className="inline-flex items-center gap-1.5 mt-3 text-sm text-brand-300 hover:text-brand-200 font-semibold"
          >
            <Github aria-hidden="true" className="h-4 w-4" />
            {t("footer", "seeRepo")}
          </Link>
        </div>
      </div>
      <div className="border-t border-ink-800 py-6 px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-500">
        <p>
          © {new Date().getFullYear()} FitConnect · {t("footer", "copyright")}
        </p>
        <p className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-accent-500 animate-pulse"
            />
            {t("footer", "statusOk")}
          </span>
          <span>v2026.5</span>
        </p>
      </div>
    </footer>
  );
}
