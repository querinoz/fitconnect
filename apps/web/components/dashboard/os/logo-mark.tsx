import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

export function LogoMark({ size = 26, className }: { size?: number; className?: string }) {
  return (
    <div className={cn("shrink-0", className)} style={{ width: size, height: size }}>
      <Logo className="h-full w-full" />
    </div>
  );
}
