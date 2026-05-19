import { BrandLogo } from "./brand-logo";
import { Wordmark } from "./wordmark";
import { cn } from "@/lib/utils";

type BrandLockupProps = {
  className?: string;
  /** Logo pixel size */
  logoSize?: number;
  /** Wordmark font size in px */
  textSize?: number;
  title?: string;
  tagline?: boolean;
  layout?: "inline" | "stack";
};

/** Logo + FitConnect name — brand sheet Option 01 lockup. */
export function BrandLockup({
  className,
  logoSize = 36,
  textSize = 18,
  title = "FitConnect",
  tagline = false,
  layout = "stack"
}: BrandLockupProps) {
  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-2.5",
        tagline && layout === "stack" && "items-start",
        className
      )}
    >
      <BrandLogo size={logoSize} title={title} className="shrink-0" />
      <Wordmark
        size={textSize}
        title={title}
        tagline={tagline}
        layout={layout}
        className="min-w-0"
      />
    </span>
  );
}
