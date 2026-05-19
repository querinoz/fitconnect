import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  size?: number;
  title?: string;
  priority?: boolean;
};

/** Transparent PNG mark — use wherever the brand icon must sit on any surface. */
export function BrandLogo({
  className,
  size = 36,
  title = "FitConnect",
  priority = false
}: BrandLogoProps) {
  return (
    <Image
      src="/logo.png"
      alt={title}
      width={size}
      height={size}
      priority={priority}
      className={cn("h-auto w-auto shrink-0 object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}
