/**
 * Full-page landing backdrop — smooth aurora, vignette, and film grain.
 * Sits behind Nav + all home sections for a cohesive premium feel.
 */
export function LandingCanvas() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-30 overflow-hidden bg-ink-950"
    >
      {/* Base depth — lighter center, dark edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-8%,#1a1c22_0%,#0c0d11_42%,#07080b_100%)]" />

      {/* Smooth drifting aurora orbs */}
      <div className="fc-landing-aurora absolute -inset-[20%] opacity-90" />

      {/* Volt spotlight behind hero */}
      <div className="absolute left-1/2 top-0 h-[min(680px,85vh)] w-[min(920px,120vw)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(200,255,0,0.09)_0%,rgba(0,221,180,0.05)_38%,transparent_68%)] blur-3xl" />

      {/* Connect accent — bottom-right */}
      <div className="absolute -bottom-32 -right-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(0,221,180,0.08)_0%,transparent_68%)] blur-3xl" />

      {/* Subtle grid fade */}
      <div className="absolute inset-0 bg-grid-dark bg-[size:72px_72px] opacity-[0.18] [mask-image:radial-gradient(ellipse_at_50%_30%,black,transparent_78%)]" />

      {/* Film grain + edge vignette */}
      <div className="absolute inset-0 bg-noise opacity-[0.28] mix-blend-overlay" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#07080b_100%)] opacity-80" />
    </div>
  );
}
