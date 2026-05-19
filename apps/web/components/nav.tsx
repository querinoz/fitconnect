"use client";

import Link from "next/link";
import {
  ChevronDown,
  Menu,
  Sparkles,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { LangPicker } from "./lang-picker";
import { CoachQuizModal } from "./coach-quiz-modal";
import { BrandLockup } from "./brand/brand-lockup";
import { useT } from "@/lib/i18n-provider";
import { useQuizModalStore } from "@/lib/quiz-modal-store";
import { cn } from "@/lib/utils";

export function Nav() {
  const t = useT();
  const setQuizOpen = useQuizModalStore((s) => s.setOpen);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);

  const primaryLinks = [
    { href: "/discover", label: t("nav", "findCoach") },
    { href: "/programs", label: t("nav", "programs") },
    { href: "/community", label: t("nav", "community") },
    { href: "/methodology", label: t("nav", "methodology") },
    { href: "/pricing", label: t("nav", "pricing") }
  ];
  const moreLinks = [
    { href: "/dashboard", label: t("nav", "dashboard") },
    { href: "/coach/dashboard", label: t("nav", "coachDashboard") },
    { href: "/trainer", label: t("nav", "forCoaches") }
  ];

  useEffect(() => {
    function onScroll() {
      const top = window.scrollY;
      const doc =
        document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(top > 24);
      setProgress(doc > 0 ? Math.min(1, top / doc) : 0);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-more]")) setMoreOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300 font-mono",
        scrolled
          ? "border-b border-ink-800/80 bg-ink-950/85 backdrop-blur-xl"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="mx-auto flex w-full min-w-0 max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-6 sm:py-3">
        <div className="flex min-w-0 items-center gap-4 sm:gap-8">
          <Link
            href="/"
            className="fc-vt-wordmark group min-w-0 transition-opacity hover:opacity-95"
          >
            <BrandLockup
              logoSize={34}
              textSize={16}
              tagline={false}
              layout="inline"
              className="sm:hidden"
            />
            <BrandLockup
              logoSize={36}
              textSize={17}
              tagline
              layout="stack"
              className="hidden sm:inline-flex"
            />
          </Link>

          <nav
            aria-label="Primary"
            className="hidden lg:flex items-center gap-5 text-xs uppercase tracking-[0.12em] text-ink-400"
          >
            {primaryLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="group relative hover:text-ink-50 transition-colors py-1.5"
              >
                {l.label}
                <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-volt-500 transition-all group-hover:w-full" />
              </Link>
            ))}
            <div className="relative" data-more>
              <button
                onClick={() => setMoreOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={moreOpen}
                className="flex items-center gap-1 hover:text-ink-50 transition-colors py-1.5"
              >
                {t("nav", "more")}
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    moreOpen && "rotate-180"
                  )}
                />
              </button>
              {moreOpen && (
                <div
                  role="menu"
                  className="absolute top-full left-0 mt-2 w-52 rounded-2xl border border-ink-800 bg-ink-950/95 backdrop-blur-xl shadow-elevated p-2"
                >
                  {moreLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      role="menuitem"
                      className="block rounded-lg px-3 py-2 text-sm text-ink-200 hover:bg-ink-800/60 hover:text-ink-50"
                      onClick={() => setMoreOpen(false)}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <LangPicker />
          <Button asChild variant="ghost" size="sm">
            <Link href="/signin">{t("nav", "signIn")}</Link>
          </Button>
          <Button size="sm" className="group gap-1.5" onClick={() => setQuizOpen(true)}>
            <Sparkles
              aria-hidden="true"
              className="h-3.5 w-3.5 transition-transform group-hover:rotate-12"
            />
            {t("nav", "matchMe")}
          </Button>
        </div>

        <div className="md:hidden flex items-center gap-1.5">
          <LangPicker compact />
          <button
            type="button"
            aria-label={t("nav", "menu")}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="p-2 text-ink-100"
          >
            {open ? (
              <X aria-hidden="true" />
            ) : (
              <Menu aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Reading progress */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-px bg-ink-800/40"
      >
        <div
          className="h-full bg-gradient-to-r from-volt-500 via-brand-400 to-cyan-500 transition-[width] duration-150"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div
        id="mobile-nav"
        className={cn(
          "md:hidden overflow-hidden transition-all border-t border-ink-800/60 bg-ink-950/95 backdrop-blur",
          open ? "max-h-[min(520px,80dvh)] py-4 safe-area-pb overflow-y-auto" : "max-h-0"
        )}
      >
        <nav aria-label="Mobile" className="flex flex-col gap-1 px-4 sm:px-6">
          {[...primaryLinks, ...moreLinks].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-ink-200 py-2.5 border-b border-ink-800/40 last:border-0"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/signin" onClick={() => setOpen(false)}>
                {t("nav", "signIn")}
              </Link>
            </Button>
            <Button className="w-full" onClick={() => { setQuizOpen(true); setOpen(false); }}>
              {t("nav", "matchMe")}
            </Button>
          </div>
        </nav>
      </div>
      <CoachQuizModal />
    </header>
  );
}
