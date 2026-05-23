"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export type CinematicMenuLink = {
  href: string;
  title: string;
  image: string;
  tone?: string;
};

type CinematicMenuProps = {
  open: boolean;
  onClose: () => void;
  exploreTitle: string;
  links: CinematicMenuLink[];
  secondaryLinks: { href: string; label: string }[];
};

export function CinematicMenu({
  open,
  onClose,
  exploreTitle,
  links,
  secondaryLinks
}: CinematicMenuProps) {
  if (!open) return null;

  return (
    <div
      id="nivis-cinematic-menu"
      className="nivis-menu-overlay flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={exploreTitle}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-28 pt-6 sm:px-6 sm:pt-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <p className="nivis-micro-label text-ink-300">{exploreTitle}</p>
          <button
            type="button"
            onClick={onClose}
            className="nivis-micro-label rounded-full border border-nivis-glass-border px-4 py-2 text-ink-200 transition hover:border-volt-500/40 hover:text-ink-50"
          >
            close ×
          </button>
        </div>

        <div className="nivis-menu-grid mb-10">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="nivis-menu-card group"
              style={{ backgroundColor: item.tone ?? "rgba(255,255,255,0.04)" }}
            >
              <Image
                src={item.image}
                alt=""
                fill
                className="object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-90"
                sizes="(max-width: 640px) 50vw, 240px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
                <span className="font-display text-sm font-semibold lowercase text-ink-50">
                  {item.title}
                </span>
                <ArrowUpRight
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-volt-500 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
            </Link>
          ))}
        </div>

        <nav aria-label="Secondary" className="mt-auto space-y-1 border-t border-ink-800/80 pt-6">
          {secondaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="group flex items-center justify-between py-3 text-sm text-ink-300 transition hover:text-ink-50"
            >
              <span className="font-medium lowercase">{link.label}</span>
              <ArrowUpRight
                aria-hidden
                className="h-4 w-4 text-ink-500 transition group-hover:text-volt-500"
              />
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
