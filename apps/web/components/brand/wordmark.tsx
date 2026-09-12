import { cn } from "@/lib/utils";

type WordmarkProps = {
  className?: string;
  size?: number;
  title?: string;
  tagline?: boolean;
  /** Stack tagline under name (brand sheet layout) */
  layout?: "inline" | "stack";
};

/**
 * FitConnect wordmark — all-caps lockup from brand sheet.
 * FIT: white · CONNECT: Voltline.
 */
export function Wordmark({
  className,
  size = 22,
  title = "FitConnect",
  tagline = false,
  layout = "inline"
}: WordmarkProps) {
  const name = (
    <span
      role="img"
      aria-label={title}
      className="inline-flex items-baseline whitespace-nowrap font-display uppercase tracking-[0.18em]"
      style={{ fontSize: size, lineHeight: 1 }}
    >
      <span className="font-extrabold text-eos-on-surface">FIT</span>
      <span className="font-extrabold text-eos-voltline">CONNECT</span>
    </span>
  );

  if (!tagline) {
    return <span className={className}>{name}</span>;
  }

  return (
    <span
      className={cn(
        layout === "stack" ? "inline-flex flex-col gap-0.5" : "inline-flex flex-col",
        className
      )}
    >
      {name}
      <span
        className="font-sans text-[0.38em] font-semibold uppercase tracking-[0.32em] text-ink-500"
        aria-hidden
      >
        Connect · Track · Evolve
      </span>
    </span>
  );
}
