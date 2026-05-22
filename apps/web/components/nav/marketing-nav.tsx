"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { LangPicker } from "@/components/lang-picker";
import { useLocale } from "@/lib/i18n-provider";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/discover", key: "discover" as const },
  { href: "/trainer", key: "coaches" as const },
  { href: "/pricing", key: "pricing" as const }
];

type MarketingNavProps = {
  /** Hide primary links on auth flows */
  minimal?: boolean;
};

/** Sticky pill nav — shared across all marketing / auth surfaces. */
export function MarketingNav({ minimal = false }: MarketingNavProps) {
  const pathname = usePathname();
  const nav = useLocale().landingEditorial.navPill;
  const localeNav = useLocale().nav;

  return (
    <header className="fixed inset-x-0 top-0 z-[90] px-4 pt-4 sm:px-6">
      <nav
        className={cn(
          "eos-glass mx-auto flex max-w-[720px] items-center justify-between gap-2 rounded-[var(--eos-radius-modal)]",
          "px-3 py-2.5 shadow-[0_24px_80px_-48px_rgba(0,0,0,.85)] sm:px-5"
        )}
        aria-label={localeNav.homeAria}
      >
        <BrandLockup
          href="/"
          layout="inline"
          logoSize={28}
          textSize={13}
          className="shrink-0 scale-90 sm:scale-100"
        />

        {!minimal && (
          <div className="hidden items-center gap-5 md:flex">
            {LINKS.map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "text-[13px] font-medium transition-colors",
                  pathname === href || pathname.startsWith(`${href}/`)
                    ? "text-volt-400"
                    : "text-ink-200 hover:text-volt-500"
                )}
              >
                {nav[key]}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          <LangPicker compact />
          {!minimal && (
            <Link
              href="/dashboard?demo=athlete"
              className="hidden rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-ink-100 transition hover:border-volt-500/30 hover:text-volt-300 sm:inline-flex"
            >
              {nav.demo}
            </Link>
          )}
          <Link
            href="/signin"
            className="hidden rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-ink-200 transition hover:border-white/20 hover:text-ink-50 sm:inline-flex"
          >
            {localeNav.signIn}
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-volt-500 px-3 py-1.5 text-xs font-semibold text-ink-950 transition hover:bg-volt-400 sm:px-4"
          >
            {nav.start}
          </Link>
        </div>
      </nav>
    </header>
  );
}
