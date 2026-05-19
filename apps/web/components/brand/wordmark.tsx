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
 * FitConnect wordmark — brand sheet lockup.
 * Fit: bold silver · Connect: Volt accent, lighter weight.
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
      className="inline-flex items-baseline whitespace-nowrap font-display tracking-[-0.04em]"
      style={{ fontSize: size, lineHeight: 1 }}
    >
      <span className="font-extrabold text-[#E6E7EA]">Fit</span>
      <span className="font-semibold text-volt-400">Connect</span>
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
