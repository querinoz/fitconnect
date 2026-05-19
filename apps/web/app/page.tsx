import dynamic from "next/dynamic";
import { HeroStatic } from "@/components/marketing/hero-static";
import { HeroExtras } from "@/components/marketing/hero-extras";
import { LandingCanvas } from "@/components/marketing/landing-canvas";
import { LazyInView } from "@/components/marketing/lazy-in-view";
import { DownloadSection } from "@/components/marketing/download-section";
import { TrustStrip } from "@/components/marketing/trust-strip";
import { GlobalInstallPrompt } from "@/components/shell/global-install-prompt";
import { Nav } from "@/components/nav";

const Footer = dynamic(
  () => import("@/components/footer").then((m) => m.Footer),
  { loading: () => <footer className="h-48 border-t border-ink-800/60" aria-hidden /> }
);

const sectionSkeleton = (height = 320) =>
  function SectionSkeleton() {
    return (
      <section className="mx-auto max-w-7xl fc-section-x px-4 py-16 sm:px-6 sm:py-24" aria-hidden>
        <div className="h-10 w-72 skeleton mb-6" />
        <div className="skeleton rounded-3xl" style={{ height }} />
      </section>
    );
  };

const HowItWorks = dynamic(
  () => import("@/components/how-it-works").then((m) => m.HowItWorks),
  { loading: sectionSkeleton(320) }
);

const FeaturedCoaches = dynamic(
  () =>
    import("@/components/marketing/featured-coaches").then((m) => m.FeaturedCoaches),
  { loading: sectionSkeleton(480) }
);

const ScienceAndTech = dynamic(
  () =>
    import("@/components/marketing/science-and-tech").then((m) => m.ScienceAndTech),
  { loading: sectionSkeleton(360) }
);

const DemosSection = dynamic(
  () =>
    import("@/components/marketing/demos-section").then((m) => m.DemosSection),
  { loading: sectionSkeleton(360) }
);

const IntegrationsStrip = dynamic(
  () =>
    import("@/components/marketing/integrations-strip").then(
      (m) => m.IntegrationsStrip
    ),
  { loading: sectionSkeleton(280) }
);

const DashboardPreview = dynamic(
  () =>
    import("@/components/dashboard-preview").then((m) => m.DashboardPreview),
  { loading: sectionSkeleton(520), ssr: false }
);

const Testimonials = dynamic(
  () => import("@/components/testimonials").then((m) => m.Testimonials),
  { loading: sectionSkeleton(360) }
);

const ComparisonTable = dynamic(
  () =>
    import("@/components/comparison-table").then((m) => m.ComparisonTable),
  { loading: sectionSkeleton(360) }
);

const Pricing = dynamic(
  () => import("@/components/pricing").then((m) => m.Pricing),
  { loading: sectionSkeleton(480) }
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
  minHeight = 320,
  noDefer = false
}: {
  children: React.ReactNode;
  minHeight?: number;
  noDefer?: boolean;
}) {
  return (
    <LazyInView minHeight={minHeight} rootMargin="160px 0px" noDefer={noDefer}>
      {children}
    </LazyInView>
  );
}

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "FitConnect",
    applicationCategory: "HealthApplication",
    operatingSystem: "Web, iOS, Android",
    offers: { "@type": "Offer", price: "12", priceCurrency: "EUR" }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingCanvas />
      <Nav />
      <main id="main" className="fc-page-root relative w-full">
        <div className="fc-hero-shell relative w-full min-w-0">
          <div className="mx-auto grid max-w-7xl items-start gap-8 fc-section-x px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)] lg:items-center lg:gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,360px)] xl:gap-12">
            <HeroStatic />
            <HeroExtras />
          </div>
        </div>

        <TrustStrip />

        <Defer minHeight={320} noDefer>
          <HowItWorks />
        </Defer>

        <Defer minHeight={480} noDefer>
          <FeaturedCoaches />
        </Defer>

        <Defer minHeight={360}>
          <ScienceAndTech />
        </Defer>

        <Defer minHeight={360}>
          <DemosSection />
        </Defer>

        <Defer minHeight={280}>
          <IntegrationsStrip />
        </Defer>

        <Defer minHeight={520}>
          <DashboardPreview />
        </Defer>

        <Defer minHeight={360}>
          <Testimonials />
        </Defer>

        <Defer minHeight={360}>
          <ComparisonTable />
        </Defer>

        <Defer minHeight={480} noDefer>
          <Pricing />
        </Defer>

        <Defer minHeight={360}>
          <Faqs />
        </Defer>

        <Defer minHeight={240}>
          <Cta />
        </Defer>

        <DownloadSection />
      </main>
      <Footer />
    </>
  );
}
