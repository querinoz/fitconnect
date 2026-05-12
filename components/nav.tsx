"use client";

import Link from "next/link";
import {
  ChevronDown,
  Dumbbell,
  Menu,
  Sparkles,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const primaryLinks = [
  { href: "/discover", label: "Find a coach" },
  { href: "/programs", label: "Programs" },
  { href: "/community", label: "Community" },
  { href: "/methodology", label: "Methodology" },
  { href: "/pricing", label: "Pricing" }
];

const moreLinks = [
  { href: "/dashboard", label: "Athlete dashboard" },
  { href: "/trainer", label: "For coaches" }
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);

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
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-ink-950/85 backdrop-blur-xl border-b border-ink-800/80 shadow-elevated"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-display font-bold text-lg"
          >
            <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 text-ink-950 shadow-glow">
              <Dumbbell className="h-5 w-5" />
              <span className="absolute -inset-0.5 -z-10 rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 opacity-40 blur" />
            </div>
            <span>
              Fit<span className="text-brand-400">Connect</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-sm text-ink-300">
            {primaryLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="relative hover:text-ink-50 transition-colors py-1.5"
              >
                {l.label}
                <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-brand-400 transition-all group-hover:w-full" />
              </Link>
            ))}
            <div className="relative" data-more>
              <button
                onClick={() => setMoreOpen((v) => !v)}
                className="flex items-center gap-1 hover:text-ink-50 transition-colors py-1.5"
              >
                More
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    moreOpen && "rotate-180"
                  )}
                />
              </button>
              {moreOpen && (
                <div className="absolute top-full left-0 mt-2 w-52 rounded-2xl border border-ink-800 bg-ink-950/95 backdrop-blur-xl shadow-elevated p-2">
                  {moreLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
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
          <Button asChild variant="ghost" size="sm">
            <Link href="/discover">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="group">
            <Link href="/discover" className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 transition-transform group-hover:rotate-12" />
              Match me in 60s
            </Link>
          </Button>
        </div>

        <button
          aria-label="menu"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 text-ink-100"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Reading progress */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-ink-800/40">
        <div
          className="h-full bg-gradient-to-r from-brand-400 via-accent-500 to-plasma-500 transition-[width] duration-150"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div
        className={cn(
          "md:hidden overflow-hidden transition-all border-t border-ink-800/60 bg-ink-950/95 backdrop-blur",
          open ? "max-h-[480px] py-4" : "max-h-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-6">
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
          <Button asChild className="mt-4 w-full">
            <Link href="/discover" onClick={() => setOpen(false)}>
              Match me in 60s
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
