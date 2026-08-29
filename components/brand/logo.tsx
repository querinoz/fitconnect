/**
 * @deprecated Use FitConnectLogo from ./fitconnect-logo for official brand assets.
 * Kept for backward compatibility — renders official LogoMark SVG.
 */
import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  animated?: boolean;
  title?: string;
};

export function Logo({ className, title = "FitConnect" }: LogoProps) {
  return (
    <Image
      src="/brand/logomark-official-256.png"
      alt={title}
      width={36}
      height={36}
      className={cn("h-9 w-9 object-contain", className)}
    />
  );
}

export function LogoMono({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/logomark-official-64.png"
      alt="FitConnect"
      width={20}
      height={20}
      className={cn("h-5 w-5 object-contain", className)}
    />
  );
}
