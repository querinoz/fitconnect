import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type LogoVariant = "full" | "icon";

type FitConnectLogoProps = {
  variant?: LogoVariant;
  className?: string;
  /** When set, wraps logo in a link (e.g. HOME / Feed). */
  href?: string;
  /** Accessible label override */
  label?: string;
  /** Icon size in px (icon variant only) */
  iconSize?: number;
  priority?: boolean;
};

const ASSETS = {
  full: "/brand/logo-full-official.png",
  icon: "/brand/logomark-official-256.png"
} as const;

/**
 * Official FitConnect brand logo.
 * Uses supplied brand assets — do not redraw.
 */
export function FitConnectLogo({
  variant = "full",
  className,
  href,
  label = "FitConnect — home",
  iconSize = 36,
  priority = false
}: FitConnectLogoProps) {
  const img =
    variant === "full" ? (
      <Image
        src={ASSETS.full}
        alt="FitConnect"
        width={180}
        height={48}
        priority={priority}
        className={cn("h-9 w-auto object-contain", className)}
      />
    ) : (
      <Image
        src={ASSETS.icon}
        alt="FitConnect"
        width={iconSize}
        height={iconSize}
        priority={priority}
        className={cn("object-contain shrink-0", className)}
        style={{ width: iconSize, height: iconSize }}
      />
    );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={label}
        className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt-500/50 rounded-lg"
      >
        {img}
      </Link>
    );
  }

  return img;
}
