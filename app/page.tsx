import dynamic from "next/dynamic";
import { HeroImmersive } from "@/components/marketing/hero-immersive";
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
/** Below-the-fold marketing sections — code-split to keep first load lean. */
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

const PhotoReel = dynamic(
  () => import("@/components/marketing/photo-reel").then((m) => m.PhotoReel),
  {
    loading: () => (
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 mb-8">
          <div className="h-6 w-40 skeleton mb-3" />
          <div className="h-9 w-2/3 max-w-md skeleton" />
        </div>
        <div className="flex gap-5 overflow-hidden px-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-[210px] w-[320px] shrink-0 rounded-2xl skeleton"
            />
          ))}
        </div>
      </section>
    )
  }
);

const WhyFitConnect = dynamic(
  () =>
    import("@/components/marketing/why-fitconnect").then(
      (m) => m.WhyFitConnect
    ),
  {
    loading: () => (
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="h-10 w-72 skeleton mb-4" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[210px] rounded-2xl skeleton" />
          ))}
        </div>
      </section>
    )
  }
);

const Showcases = dynamic(
  () => import("@/components/marketing/showcases").then((m) => m.Showcases),
  {
    loading: () => (
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="h-10 w-72 skeleton mb-8" />
        <div className="space-y-20">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="grid lg:grid-cols-12 gap-10 items-center"
            >
              <div className="lg:col-span-7 h-[360px] rounded-3xl skeleton" />
              <div className="lg:col-span-5 space-y-3">
                <div className="h-5 w-32 skeleton" />
                <div className="h-9 w-full max-w-sm skeleton" />
                <div className="h-20 w-full skeleton" />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }
);

const AudienceSplit = dynamic(
  () =>
    import("@/components/marketing/audience-split").then(
      (m) => m.AudienceSplit
    ),
  {
    loading: () => (
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="h-10 w-72 skeleton mb-8" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-[460px] rounded-3xl skeleton" />
          <div className="h-[460px] rounded-3xl skeleton" />
        </div>
      </section>
    )
  }
);

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <HeroImmersive />
        <PhotoReel />
        <PressStrip />
        <SportsStrip />
        <DemosSection />
        <DashboardPreview />
        <StatBar />
        <WhyFitConnect />
        <Showcases />
        <MethodologyPreview />
        <Features />
        <TrainersGrid />
        <ProgramsStrip />
        <ComparisonTable />
        <AudienceSplit />
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
