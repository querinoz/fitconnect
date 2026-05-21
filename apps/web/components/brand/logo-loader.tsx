"use client";

import { BrandLogo } from "./brand-logo";
import { cn } from "@/lib/utils";

type LogoLoaderProps = {
  label?: string;
  className?: string;
  fullscreen?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizes = { sm: 56, md: 80, lg: 104 } as const;

/** Branded page loader — rotating dial + breathing logo + EKG sweep. */
export function LogoLoader({
  label = "Loading",
  className,
  fullscreen = false,
  size = "md"
}: LogoLoaderProps) {
  const logoSize = sizes[size];

  const loader = (
    <div
      className={cn("fc-logo-loader-wrap", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <div className="fc-logo-loader" style={{ width: logoSize, height: Math.round(logoSize * 1.05) }}>
        <span className="fc-logo-loader-ring" aria-hidden />
        <span className="fc-logo-loader-ring fc-logo-loader-ring--reverse" aria-hidden />
        <BrandLogo size={logoSize} animated className="fc-logo-loader-pulse relative z-10" />
      </div>
      <svg className="fc-logo-loader-ekg" viewBox="0 0 200 24" aria-hidden>
        <path
          className="fc-logo-loader-ekg-path"
          d="M0 12 H40 L48 4 L56 20 L64 12 H200"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label ? (
        <p className="mt-5 text-center text-xs font-semibold uppercase tracking-[0.22em] text-ink-400">
          {label}
        </p>
      ) : null}
    </div>
  );

  if (fullscreen) {
    return <div className="fc-logo-loader-screen premium-grid">{loader}</div>;
  }

  return loader;
}
