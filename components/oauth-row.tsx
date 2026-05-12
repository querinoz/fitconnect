"use client";

import { useState, type ReactNode } from "react";
import { useT } from "@/lib/i18n-provider";
import { cn } from "@/lib/utils";

type Provider = {
  id: "google" | "linkedin" | "microsoft" | "apple";
  label: string;
  icon: ReactNode;
  /** Sentinel ring colour on hover. */
  ring: string;
};

const providers: Provider[] = [
  {
    id: "google",
    label: "Google",
    ring: "hover:border-[#ea4335]/50",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path
          fill="#4285f4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
        />
        <path
          fill="#34a853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
        />
        <path
          fill="#fbbc05"
          d="M5.84 14.1A6.59 6.59 0 0 1 5.5 12c0-.73.13-1.43.34-2.1V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
        />
        <path
          fill="#ea4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
        />
      </svg>
    )
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    ring: "hover:border-[#0A66C2]/60",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <rect width="24" height="24" rx="3" fill="#0A66C2" />
        <path
          fill="#fff"
          d="M7.06 9.5h2.6V18h-2.6V9.5ZM8.36 6a1.5 1.5 0 1 1 0 3.01 1.5 1.5 0 0 1 0-3Zm3.4 3.5h2.49v1.16h.04c.35-.66 1.21-1.36 2.49-1.36 2.66 0 3.15 1.75 3.15 4.03V18h-2.6v-3.97c0-.95-.02-2.18-1.33-2.18-1.33 0-1.54 1.04-1.54 2.11V18h-2.6V9.5Z"
        />
      </svg>
    )
  },
  {
    id: "microsoft",
    label: "Microsoft",
    ring: "hover:border-[#5e5e5e]/60",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <rect x="3" y="3" width="8.5" height="8.5" fill="#f35325" />
        <rect x="12.5" y="3" width="8.5" height="8.5" fill="#81bc06" />
        <rect x="3" y="12.5" width="8.5" height="8.5" fill="#05a6f0" />
        <rect x="12.5" y="12.5" width="8.5" height="8.5" fill="#ffba08" />
      </svg>
    )
  },
  {
    id: "apple",
    label: "Apple",
    ring: "hover:border-white/40",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path
          fill="#fff"
          d="M16.36 12.65c-.02-2.49 2.04-3.69 2.13-3.74-1.16-1.7-2.96-1.93-3.6-1.96-1.53-.15-2.99.9-3.77.9-.78 0-1.98-.88-3.26-.86-1.67.02-3.22.97-4.08 2.47-1.74 3.02-.45 7.49 1.24 9.93.83 1.2 1.81 2.53 3.1 2.49 1.25-.05 1.72-.8 3.23-.8 1.51 0 1.93.8 3.25.78 1.34-.02 2.19-1.21 3.01-2.42a10.4 10.4 0 0 0 1.36-2.81c-.03-.01-2.62-1-2.65-3.98ZM13.94 4.94c.69-.84 1.16-2 1.03-3.16-1 .04-2.21.66-2.92 1.49-.64.74-1.2 1.92-1.05 3.05 1.11.09 2.25-.56 2.94-1.38Z"
        />
      </svg>
    )
  }
];

export function OAuthRow() {
  const t = useT();
  const [pending, setPending] = useState<Provider["id"] | null>(null);

  return (
    <div className="space-y-3">
      <p className="text-center text-xs uppercase tracking-widest text-ink-500">
        {t("auth", "continueWith")}
      </p>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {providers.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={pending !== null}
            onClick={() => {
              setPending(p.id);
              window.setTimeout(() => setPending(null), 1400);
            }}
            aria-label={`${t("auth", "continueWith")} ${p.label}`}
            className={cn(
              "group relative inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-ink-800 bg-ink-950/60 text-sm font-semibold text-ink-100 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60",
              p.ring
            )}
          >
            <span className="grid h-6 w-6 place-items-center rounded-md bg-ink-900/80 ring-1 ring-ink-800">
              {p.icon}
            </span>
            <span className="hidden sm:inline">{p.label}</span>
            <span className="sm:hidden">{p.label}</span>
            {pending === p.id && (
              <span className="absolute inset-x-2 -bottom-px h-px overflow-hidden rounded-full bg-ink-800">
                <span className="block h-full w-1/2 animate-[loading-bar_1.4s_linear] bg-gradient-to-r from-brand-400 to-accent-500" />
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="relative py-1">
        <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-ink-800" />
        <span className="relative mx-auto block w-fit bg-ink-950 px-3 text-[11px] uppercase tracking-widest text-ink-500">
          {t("auth", "or")}
        </span>
      </div>
    </div>
  );
}
