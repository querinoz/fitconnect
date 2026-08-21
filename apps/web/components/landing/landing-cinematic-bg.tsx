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

/** Static SVG fractal grain — 3% max, frozen under reduced motion. */
const FRACTAL_GRAIN =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")";

/** Hero-matching grid + drifting aurora — copy stays independent of motion. */
export function LandingCinematicBg({ variant = "athlete", className }: LandingCinematicBgProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div
        className="absolute inset-0 opacity-[0.03] contrast-150 brightness-150 motion-reduce:opacity-[0.03]"
        style={{ backgroundImage: FRACTAL_GRAIN }}
      />
      <CrosshairBg className="absolute inset-0" showGlow />
      <div className={cn("eos-aurora-blob -left-[12%] top-[8%] h-[28rem] w-[28rem] motion-reduce:animate-none", BLOBS[variant])} />
      <div className="eos-aurora-blob -right-[8%] bottom-[4%] h-[22rem] w-[22rem] bg-eos-iris/10 [animation-delay:-6s] motion-reduce:animate-none" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--eos-floor)] to-transparent" />
    </div>
  );
}
