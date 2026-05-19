import { cn } from "@/lib/utils";

type WordmarkProps = {
  className?: string;
  size?: number;
  /** @deprecated Option 01 lockup uses continuous FitConnect wordmark */
  node?: boolean;
  title?: string;
  /** Show tagline under the name */
  tagline?: boolean;
};

/**
 * FitConnect wordmark — Option 01 lockup.
 * Fit: bold silver · Connect: medium weight with Volt metallic gradient.
 */
export function Wordmark({
  className,
  size = 22,
  title = "FitConnect",
  tagline = false
}: WordmarkProps) {
  return (
    <span className={cn("inline-flex flex-col", className)}>
      <span
        role="img"
        aria-label={title}
        className="inline-flex items-baseline font-display tracking-[-0.03em]"
        style={{ fontSize: size, lineHeight: 1.05 }}
      >
        <span className="font-extrabold text-ink-50 drop-shadow-[0_1px_0_rgba(255,255,255,0.08)]">
          Fit
        </span>
        <span
          className="font-medium bg-gradient-to-r from-ink-200 via-volt-300 to-volt-500 bg-clip-text text-transparent"
          style={{ textShadow: "0 0 24px rgba(200,255,0,0.12)" }}
        >
          Connect
        </span>
      </span>
      {tagline ? (
        <span
          className="mt-1 text-[0.42em] font-semibold uppercase tracking-[0.28em] text-ink-500"
          aria-hidden
        >
          Connect · Track · Evolve
        </span>
      ) : null}
    </span>
  );
}
