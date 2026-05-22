"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { LangPicker } from "@/components/lang-picker";
import { useLocale } from "@/lib/i18n-provider";
import { cn } from "@/lib/utils";

type NavbarPillProps = {
  enabled?: boolean;
};

/** Floating pill navbar — Lando-style; fades in after scroll. */
export function NavbarPill({ enabled = true }: NavbarPillProps) {
  const nav = useLocale().landingEditorial.navPill;
  const localeNav = useLocale().nav;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const onScroll = () => setVisible(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <header
      className={cn(
        "fixed left-1/2 top-5 z-[90] w-[calc(100%-2rem)] max-w-[680px] -translate-x-1/2 transition-all duration-500",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
      )}
    >
      <nav
        className={cn(
          "flex items-center justify-between gap-2 rounded-full border border-white/10",
          "bg-ink-950/85 px-3 py-2.5 backdrop-blur-xl sm:px-5"
        )}
        aria-label={localeNav.homeAria}
      >
        <BrandLockup href="/" layout="inline" logoSize={28} textSize={13} className="shrink-0 scale-90 sm:scale-100" />

        <div className="hidden items-center gap-5 md:flex">
          <Link href="/discover" className="text-[13px] font-medium text-ink-200 hover:text-volt-500">
            {nav.discover}
          </Link>
          <Link href="/trainer" className="text-[13px] font-medium text-ink-200 hover:text-volt-500">
            {nav.coaches}
          </Link>
          <Link href="/pricing" className="text-[13px] font-medium text-ink-200 hover:text-volt-500">
            {nav.pricing}
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LangPicker compact />
          <Link
            href="/dashboard?demo=athlete"
            className="hidden rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-ink-100 sm:inline-flex"
          >
            {nav.demo}
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-volt-500 px-3 py-1.5 text-xs font-semibold text-ink-950 hover:bg-volt-400 sm:px-4"
          >
            {nav.start}
          </Link>
        </div>
      </nav>
    </header>
  );
}
