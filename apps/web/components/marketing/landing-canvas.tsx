/**
 * Landing backdrop — smooth mesh glow, minimal noise, premium dark depth.
 */
export function LandingCanvas() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-30 overflow-hidden bg-[#07080b]"
    >
      {/* Base luminance — soft lift at top center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,#1a1c22_0%,#0c0d11_45%,#07080b_100%)]" />

      {/* Animated mesh blobs */}
      <div className="fc-landing-mesh absolute inset-0">
        <div className="fc-landing-blob fc-landing-blob-a" />
        <div className="fc-landing-blob fc-landing-blob-b" />
        <div className="fc-landing-blob fc-landing-blob-c" />
      </div>

      {/* Hero Volt bloom */}
      <div className="absolute left-1/2 top-[-10%] h-[min(720px,90vh)] w-[min(960px,130vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(200,255,0,0.07)_0%,transparent_62%)] blur-[100px]" />

      {/* Edge vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#07080b_88%)]" />

      {/* Fine grain — very subtle */}
      <div className="absolute inset-0 bg-noise opacity-[0.14] mix-blend-soft-light" />
    </div>
  );
}
