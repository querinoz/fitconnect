"use client";

import Link from "next/link";
import { Dumbbell, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/discover", label: "Find a trainer" },
  { href: "/dashboard", label: "Athlete dashboard" },
  { href: "/trainer", label: "Become a trainer" },
  { href: "/#pricing", label: "Pricing" }
];

export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-ink-200/40 dark:border-ink-800/60 bg-white/70 dark:bg-ink-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 text-ink-950">
            <Dumbbell className="h-5 w-5" />
          </div>
          <span>
            Fit<span className="text-brand-400">Connect</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm text-ink-300">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hover:text-ink-50 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/discover">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/discover">Get started</Link>
          </Button>
        </div>

        <button
          aria-label="menu"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      <div
        className={cn(
          "md:hidden overflow-hidden transition-all border-t border-ink-800/60",
          open ? "max-h-96 py-4" : "max-h-0"
        )}
      >
        <nav className="flex flex-col gap-3 px-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-ink-200 py-1"
            >
              {l.label}
            </Link>
          ))}
          <Button asChild className="mt-3">
            <Link href="/discover">Get started</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
