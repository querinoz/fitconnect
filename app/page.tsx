import dynamic from "next/dynamic";
import { Nav } from "@/components/nav";
import { PressStrip } from "@/components/press-strip";
import { SportsStrip } from "@/components/sports-strip";
import { StatBar } from "@/components/stat-bar";
import { MethodologyPreview } from "@/components/methodology-preview";
import { Features } from "@/components/features";
import { TrainersGrid } from "@/components/trainers-grid";
import { ProgramsStrip } from "@/components/programs-strip";
import { ComparisonTable } from "@/components/comparison-table";
import { DashboardPreview } from "@/components/dashboard-preview";
import { CoachQuiz } from "@/components/coach-quiz";
import { Testimonials } from "@/components/testimonials";
import { HowItWorks } from "@/components/how-it-works";
import { CitiesStrip } from "@/components/cities-strip";
import { Pricing } from "@/components/pricing";
import { Faqs } from "@/components/faqs";
import { Cta } from "@/components/cta";
import { Footer } from "@/components/footer";
import { DemoBanner } from "@/components/demo-banner";

/**
 * Heavy decorative pieces — they don't need to ship in the initial
 * HTML and they make liberal use of CSS animations + SVGs. We code-
 * split them via `next/dynamic`. Loading skeletons keep layout stable
 * so we don't pay the CLS tax.
 */
const HeroImmersive = dynamic(
  () =>
    import("@/components/marketing/hero-immersive").then((m) => m.HeroImmersive),
  {
    loading: () => (
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-28">
        <div className="mx-auto max-w-7xl px-6 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6 space-y-6">
            <div className="h-7 w-72 skeleton" />
            <div className="h-12 w-full max-w-md skeleton" />
            <div className="h-24 w-full max-w-2xl skeleton" />
            <div className="flex gap-3">
              <div className="h-12 w-44 skeleton" />
              <div className="h-12 w-44 skeleton" />
            </div>
          </div>
          <div className="lg:col-span-6 h-[440px] skeleton rounded-3xl" />
        </div>
      </section>
    )
  }
);

const DemosSection = dynamic(
  () =>
    import("@/components/marketing/demos-section").then((m) => m.DemosSection),
  {
    loading: () => (
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="h-10 w-72 skeleton mb-4" />
        <div className="grid gap-8 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[360px] skeleton rounded-3xl" />
          ))}
        </div>
      </section>
    )
  }
);

export default function Home() {
  return (
    <>
      <DemoBanner />
      <Nav />
      <main id="main">
        <HeroImmersive />
        <PressStrip />
        <SportsStrip />
        <DemosSection />
        <StatBar />
        <MethodologyPreview />
        <Features />
        <TrainersGrid />
        <ProgramsStrip />
        <ComparisonTable />
        <DashboardPreview />
        <CoachQuiz />
        <Testimonials />
        <HowItWorks />
        <CitiesStrip />
        <Pricing />
        <Faqs />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
