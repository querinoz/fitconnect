import dynamic from "next/dynamic";
import { HeroStatic } from "@/components/marketing/hero-static";
import { HeroExtras } from "@/components/marketing/hero-extras";
import { LazyInView } from "@/components/marketing/lazy-in-view";
import { Nav } from "@/components/nav";

const Footer = dynamic(
  () => import("@/components/footer").then((m) => m.Footer),
  { loading: () => <footer className="h-48 border-t border-ink-800/60" aria-hidden /> }
);

const sectionSkeleton = (height = 320) =>
  function SectionSkeleton() {
    return (
      <section className="mx-auto max-w-7xl px-6 py-24" aria-hidden>
        <div className="h-10 w-72 skeleton mb-6" />
        <div className="skeleton rounded-3xl" style={{ height }} />
      </section>
    );
  };

const DemosSection = dynamic(
  () =>
    import("@/components/marketing/demos-section").then((m) => m.DemosSection),
  { loading: sectionSkeleton(360) }
);

const DashboardPreview = dynamic(
  () =>
    import("@/components/dashboard-preview").then((m) => m.DashboardPreview),
  { loading: sectionSkeleton(520), ssr: false }
);

const PhotoReel = dynamic(
  () => import("@/components/marketing/photo-reel").then((m) => m.PhotoReel),
  { loading: sectionSkeleton(210), ssr: false }
);

const PressStrip = dynamic(
  () => import("@/components/press-strip").then((m) => m.PressStrip),
  { loading: () => <div className="h-24 skeleton border-y border-ink-800/60" aria-hidden /> }
);

const SportsStrip = dynamic(
  () => import("@/components/sports-strip").then((m) => m.SportsStrip),
  { loading: sectionSkeleton(120) }
);

const StatBar = dynamic(
  () => import("@/components/stat-bar").then((m) => m.StatBar),
  { loading: sectionSkeleton(140) }
);

const Showcases = dynamic(
  () => import("@/components/marketing/showcases").then((m) => m.Showcases),
  { loading: sectionSkeleton(360), ssr: false }
);

const WhyFitConnect = dynamic(
  () =>
    import("@/components/marketing/why-fitconnect").then(
      (m) => m.WhyFitConnect
    ),
  { loading: sectionSkeleton(420) }
);

const MethodologyPreview = dynamic(
  () =>
    import("@/components/methodology-preview").then(
      (m) => m.MethodologyPreview
    ),
  { loading: sectionSkeleton(360) }
);

const Features = dynamic(
  () => import("@/components/features").then((m) => m.Features),
  { loading: sectionSkeleton(480) }
);

const TrainersGrid = dynamic(
  () => import("@/components/trainers-grid").then((m) => m.TrainersGrid),
  { loading: sectionSkeleton(480), ssr: false }
);

const ProgramsStrip = dynamic(
  () => import("@/components/programs-strip").then((m) => m.ProgramsStrip),
  { loading: sectionSkeleton(280) }
);

const ComparisonTable = dynamic(
  () =>
    import("@/components/comparison-table").then((m) => m.ComparisonTable),
  { loading: sectionSkeleton(360) }
);

const AudienceSplit = dynamic(
  () =>
    import("@/components/marketing/audience-split").then(
      (m) => m.AudienceSplit
    ),
  { loading: sectionSkeleton(460) }
);

const CoachQuiz = dynamic(
  () => import("@/components/coach-quiz").then((m) => m.CoachQuiz),
  { loading: sectionSkeleton(400), ssr: false }
);

const Testimonials = dynamic(
  () => import("@/components/testimonials").then((m) => m.Testimonials),
  { loading: sectionSkeleton(360) }
);

const HowItWorks = dynamic(
  () => import("@/components/how-it-works").then((m) => m.HowItWorks),
  { loading: sectionSkeleton(320) }
);

const CitiesStrip = dynamic(
  () => import("@/components/cities-strip").then((m) => m.CitiesStrip),
  { loading: sectionSkeleton(160) }
);

const Pricing = dynamic(
  () => import("@/components/pricing").then((m) => m.Pricing),
  { loading: sectionSkeleton(480), ssr: false }
);

const Faqs = dynamic(
  () => import("@/components/faqs").then((m) => m.Faqs),
  { loading: sectionSkeleton(360) }
);

const Cta = dynamic(
  () => import("@/components/cta").then((m) => m.Cta),
  { loading: sectionSkeleton(240) }
);

function Defer({
  children,
  minHeight = 320
}: {
  children: React.ReactNode;
  minHeight?: number;
}) {
  return (
    <LazyInView minHeight={minHeight} rootMargin="160px 0px">
      {children}
    </LazyInView>
  );
}

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <div className="relative">
          <HeroStatic />
          <LazyInView minHeight={280} rootMargin="200px 0px">
            <HeroExtras />
          </LazyInView>
        </div>
        <Defer minHeight={360}>
          <DemosSection />
        </Defer>
        <Defer minHeight={520}>
          <DashboardPreview />
        </Defer>
        <Defer minHeight={210}>
          <PhotoReel />
        </Defer>
        <Defer minHeight={120}>
          <PressStrip />
        </Defer>
        <Defer minHeight={120}>
          <SportsStrip />
        </Defer>
        <Defer minHeight={140}>
          <StatBar />
        </Defer>
        <Defer minHeight={360}>
          <Showcases />
        </Defer>
        <Defer minHeight={420}>
          <WhyFitConnect />
        </Defer>
        <Defer minHeight={360}>
          <MethodologyPreview />
        </Defer>
        <Defer minHeight={480}>
          <Features />
        </Defer>
        <Defer minHeight={480}>
          <TrainersGrid />
        </Defer>
        <Defer minHeight={280}>
          <ProgramsStrip />
        </Defer>
        <Defer minHeight={360}>
          <ComparisonTable />
        </Defer>
        <Defer minHeight={460}>
          <AudienceSplit />
        </Defer>
        <Defer minHeight={400}>
          <CoachQuiz />
        </Defer>
        <Defer minHeight={360}>
          <Testimonials />
        </Defer>
        <Defer minHeight={320}>
          <HowItWorks />
        </Defer>
        <Defer minHeight={160}>
          <CitiesStrip />
        </Defer>
        <Defer minHeight={480}>
          <Pricing />
        </Defer>
        <Defer minHeight={360}>
          <Faqs />
        </Defer>
        <Defer minHeight={240}>
          <Cta />
        </Defer>
      </main>
      <Footer />
    </>
  );
}
