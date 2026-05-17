"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Globe } from "lucide-react";
import { LANGS, type Lang } from "@/lib/i18n";
import { useLanguage } from "@/lib/i18n-provider";
import { cn } from "@/lib/utils";

export function LangPicker({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("common", "languageMenu")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-ink-800 bg-ink-900/40 text-ink-200 hover:text-ink-50 hover:border-ink-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60",
          compact ? "h-9 px-2.5 text-xs" : "h-9 px-3 text-sm"
        )}
      >
        <FlagSquare code={current.flag} className="h-4 w-4" />
        <span className="hidden sm:inline tabular-nums">
          {current.code.toUpperCase()}
        </span>
        <Globe className="h-3.5 w-3.5 text-ink-500 sm:hidden" />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("common", "selectLanguage")}
          className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-ink-800 bg-ink-950/95 backdrop-blur-xl shadow-elevated p-1.5 z-50"
        >
          {LANGS.map((l) => {
            const selected = l.code === lang;
            return (
              <li key={l.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    setLang(l.code as Lang);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60",
                    selected
                      ? "bg-brand-500/15 text-ink-50"
                      : "text-ink-200 hover:bg-ink-800/60"
                  )}
                >
                  <FlagSquare code={l.flag} className="h-5 w-5" />
                  <span className="flex-1">{l.native}</span>
                  {selected && <Check className="h-4 w-4 text-brand-300" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function FlagSquare({
  code,
  className
}: {
  code: (typeof LANGS)[number]["flag"];
  className?: string;
}) {
  const wrap = cn(
    "rounded-[3px] overflow-hidden ring-1 ring-ink-800/50",
    className
  );

  switch (code) {
    case "PT":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={wrap}>
          <rect width="24" height="24" fill="#006233" />
          <rect x="9" width="15" height="24" fill="#dd0915" />
          <circle cx="9" cy="12" r="3.7" fill="#fdd400" stroke="#fff" strokeWidth="0.4" />
          <circle cx="9" cy="12" r="2.4" fill="#dd0915" />
        </svg>
      );
    case "ES":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={wrap}>
          <rect width="24" height="24" fill="#c60b1e" />
          <rect y="6" width="24" height="12" fill="#ffc400" />
        </svg>
      );
    case "FR":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={wrap}>
          <rect width="8" height="24" fill="#002395" />
          <rect x="8" width="8" height="24" fill="#fff" />
          <rect x="16" width="8" height="24" fill="#ed2939" />
        </svg>
      );
    case "DE":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={wrap}>
          <rect width="24" height="8" fill="#000" />
          <rect y="8" width="24" height="8" fill="#dd0000" />
          <rect y="16" width="24" height="8" fill="#ffce00" />
        </svg>
      );
    case "IT":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={wrap}>
          <rect width="8" height="24" fill="#009246" />
          <rect x="8" width="8" height="24" fill="#fff" />
          <rect x="16" width="8" height="24" fill="#ce2b37" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={wrap}>
          <rect width="24" height="24" fill="#012169" />
          <path d="M0 0L24 24M24 0L0 24" stroke="#fff" strokeWidth="3" />
          <path d="M0 0L24 24M24 0L0 24" stroke="#C8102E" strokeWidth="1.5" />
          <path d="M12 0V24M0 12H24" stroke="#fff" strokeWidth="5" />
          <path d="M12 0V24M0 12H24" stroke="#C8102E" strokeWidth="3" />
        </svg>
      );
  }
}
