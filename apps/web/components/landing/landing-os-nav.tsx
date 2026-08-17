"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { EliteButton } from "@/components/elite-os";
import { LangPicker } from "@/components/lang-picker";
import { useLocale } from "@/lib/i18n-provider";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#athlete-os", key: "navOverview" as const },
  { href: "#demo", key: "navTelemetry" as const },
  { href: "#manifesto", key: "navManifesto" as const },
  { href: "#ecosystem", key: "navEcosystem" as const }
];

export function LandingOsNav() {
  const e = useLocale().landingEditorial.heroElite;
  const localeNav = useLocale().nav;
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[90] px-4 pt-4 sm:px-6">
      <nav
        className="pointer-events-auto mx-auto flex min-w-0 max-w-[1440px] items-center justify-between gap-3 overflow-hidden rounded-full border border-white/10 bg-[var(--eos-floor)]/72 px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl"
        aria-label={localeNav.homeAria}
      >
        <BrandLockup href="/" layout="inline" logoSize={28} textSize={13} className="min-w-0 shrink" />
        <div className="hidden items-center gap-5 lg:flex">
          {LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="eos-label-caps flex h-11 items-center leading-none text-eos-on-surface-muted transition hover:text-eos-on-surface"
            >
              {e[item.key]}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <LangPicker compact />
          <EliteButton asChild size="sm" className="hidden rounded-full sm:inline-flex">
            <Link href="/signup">{e.navInitialize}</Link>
          </EliteButton>
          <EliteButton
            type="button"
            variant="ghost"
            size="sm"
            className="lg:hidden"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? e.navClose : e.navMenu}
          </EliteButton>
        </div>
      </nav>
      {open ? (
        <div
          id={panelId}
          className="pointer-events-auto mx-auto mt-2 max-w-[1440px] rounded-3xl border border-white/10 bg-[var(--eos-floor)]/92 p-4 backdrop-blur-2xl lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex min-h-11 items-center rounded-xl px-3 eos-label-caps text-eos-on-surface"
                  )}
                  onClick={() => setOpen(false)}
                >
                  {e[item.key]}
                </Link>
              </li>
            ))}
            <li>
              <EliteButton asChild className="mt-2 w-full rounded-full">
                <Link href="/signup" onClick={() => setOpen(false)}>
                  {e.navInitialize}
                </Link>
              </EliteButton>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
