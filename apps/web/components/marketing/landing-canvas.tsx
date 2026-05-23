import { OrbsLayer } from "@/components/marketing/ck/orbs-layer";
import { cn } from "@/lib/utils";

/**
 * Landing backdrop — smooth mesh glow, floating orbs, premium dark depth.
 */
export function LandingCanvas({ subdued = false }: { subdued?: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 -z-30 overflow-hidden bg-ink-950",
        subdued && "opacity-50"
      )}
    >
      <OrbsLayer />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,#1a1814_0%,#0c0a08_45%,#090402_100%)]" />

      <div className="fc-landing-mesh absolute inset-0">
        <div className="fc-landing-blob fc-landing-blob-a" />
        <div className="fc-landing-blob fc-landing-blob-b" />
        <div className="fc-landing-blob fc-landing-blob-c" />
      </div>

      <div className={cn("fc-landing-aurora absolute inset-0", subdued ? "opacity-40" : "opacity-70")} />

      <div className="absolute left-1/2 top-[-10%] h-[min(720px,90vh)] w-[min(960px,130vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(191,238,22,0.06)_0%,transparent_62%)] blur-[100px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#090402_88%)]" />
      <div className="absolute inset-0 bg-noise opacity-[0.12] mix-blend-soft-light" />
    </div>
  );
}
