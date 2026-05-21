"use client";

import Link from "next/link";
import { LayoutGrid, X } from "lucide-react";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { cn } from "@/lib/utils";

type NivisBarProps = {
  menuOpen: boolean;
  onMenuToggle: () => void;
  signInLabel: string;
  menuLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
};

/** Bottom floating bar — Nivis Gear pattern (brand pill + actions + lime MENU). */
export function NivisBar({
  menuOpen,
  onMenuToggle,
  signInLabel,
  menuLabel,
  secondaryHref = "/signin",
  secondaryLabel,
  className
}: NivisBarProps) {
  return (
    <div className={cn("nivis-bar", className)} role="navigation" aria-label="Primary">
      <div className="nivis-bar__brand">
        <Link href="/" className="min-w-0 transition-opacity hover:opacity-90">
          <BrandLockup logoSize={32} textSize={15} tagline={false} layout="inline" />
        </Link>
      </div>

      <div className="nivis-bar__actions">
        <Link href={secondaryHref} className="nivis-bar__pill hidden sm:inline-flex">
          {secondaryLabel ?? signInLabel}
        </Link>
        <button
          type="button"
          className="nivis-bar__pill nivis-bar__pill--menu"
          aria-expanded={menuOpen}
          aria-controls="nivis-cinematic-menu"
          onClick={onMenuToggle}
        >
          {menuOpen ? <X className="h-4 w-4" aria-hidden /> : <LayoutGrid className="h-4 w-4" aria-hidden />}
          <span>{menuOpen ? "close" : menuLabel}</span>
        </button>
      </div>
    </div>
  );
}
