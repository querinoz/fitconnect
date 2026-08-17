import { CrosshairBg } from "@/components/elite-os";
import { cn } from "@/lib/utils";

type LandingCinematicBgProps = {
  variant?: "athlete" | "coach" | "together";
  className?: string;
};

const BLOBS = {
  athlete: "bg-eos-voltline/15",
  coach: "bg-eos-connect/14",
  together: "bg-eos-telemetry/14"
} as const;

/** Hero-matching grid + drifting aurora — copy stays independent of motion. */
export function LandingCinematicBg({ variant = "athlete", className }: LandingCinematicBgProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <CrosshairBg className="absolute inset-0" showGlow />
      <div className={cn("eos-aurora-blob -left-[12%] top-[8%] h-[28rem] w-[28rem]", BLOBS[variant])} />
      <div className="eos-aurora-blob -right-[8%] bottom-[4%] h-[22rem] w-[22rem] bg-eos-iris/10 [animation-delay:-6s]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--eos-floor)] to-transparent" />
    </div>
  );
}
