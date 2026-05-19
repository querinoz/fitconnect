import { cn } from "@/lib/utils";

type WordmarkProps = {
  className?: string;
  size?: number;
  /** Show the Volt connection node between Fit and Connect */
  node?: boolean;
  title?: string;
};

/**
 * Fit·Connect wordmark — Syne display with Volt identity node.
 */
export function Wordmark({
  className,
  size = 22,
  node = true,
  title = "FitConnect"
}: WordmarkProps) {
  return (
    <span
      role="img"
      aria-label={title}
      className={cn(
        "inline-flex items-baseline font-display font-extrabold tracking-[-0.04em] text-ink-50",
        className
      )}
      style={{ fontSize: size, lineHeight: 1 }}
    >
      Fit
      {node ? (
        <span
          className="mx-[0.12em] mb-[0.08em] inline-block shrink-0 rounded-full bg-volt-500 shadow-[0_0_16px_var(--volt-glow)]"
          style={{ width: size * 0.36, height: size * 0.36 }}
          aria-hidden
        />
      ) : null}
      <span className="text-volt-500">Connect</span>
    </span>
  );
}
