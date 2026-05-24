import { BrandLogo } from "@/components/brand/brand-logo";
import { cn } from "@/lib/utils";

export function LogoMark({ size = 26, className }: { size?: number; className?: string }) {
  return <BrandLogo size={size} className={cn("shrink-0", className)} />;
}
