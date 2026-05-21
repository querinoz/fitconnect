import dynamic from "next/dynamic";
import { HeroImmersive } from "@/components/marketing/landing-v2/hero-immersive";
import { TrustStripMarquee } from "@/components/marketing/landing-v2/trust-strip-marquee";
import { LandingCanvas } from "@/components/marketing/landing-canvas";
import { LazyInView } from "@/components/marketing/lazy-in-view";
import { DownloadSection } from "@/components/marketing/download-section";
import { AppDemoSection } from "@/components/marketing/landing-v2/app-demo-section";
import { SocialProofSection } from "@/components/marketing/landing-v2/social-proof-section";

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

const ScrollStory = dynamic(
  () =>
    import("@/components/marketing/landing-v2/scroll-story").then((m) => m.ScrollStory),
  { loading: sectionSkeleton(480), ssr: false }
);

const SportsHub = dynamic(
  () =>
    import("@/components/marketing/landing-v2/sports-hub").then((m) => m.SportsHub),
  { loading: sectionSkeleton(400) }
);

const MapHeroSection = dynamic(
  () =>
    import("@/components/marketing/landing-v2/map-hero-section").then((m) => m.MapHeroSection),
  { loading: sectionSkeleton(560), ssr: false }
);

const FeaturedCoaches = dynamic(
  () =>
    import("@/components/marketing/featured-coaches").then((m) => m.FeaturedCoaches),
  { loading: sectionSkeleton(480) }
);

const HowItWorks = dynamic(
  () => import("@/components/how-it-works").then((m) => m.HowItWorks),
  { loading: sectionSkeleton(320) }
);

const ScienceAndTech = dynamic(
  () =>
    import("@/components/marketing/science-and-tech").then((m) => m.ScienceAndTech),
  { loading: sectionSkeleton(360) }
);

const Pricing = dynamic(
  () => import("@/components/pricing").then((m) => m.Pricing),
  { loading: sectionSkeleton(480) }
);

const Faqs = dynamic(
  () => import("@/components/faqs").then((m) => m.Faqs),
  { loading: sectionSkeleton(400) }
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

/** Landing v2 — full 14-section cinematic page (Nivis-style). */
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
      <LandingCanvas subdued />
      <main id="main" className="fc-page-root landing-v2-root relative flex w-full flex-col">
        {/* 1 Hero cinematic — full viewport, video bg, Nivis bar */}
        <div className="order-1">
          <HeroImmersive />
        </div>

        {/* 2 Trust strip + marquee */}
        <div className="order-2">
          <TrustStripMarquee />
        </div>

        {/* 11 Pricing — bumped up on mobile */}
        <div className="order-4 lg:order-11">
          <Defer minHeight={480} noDefer>
            <Pricing />
          </Defer>
        </div>

        {/* 3 Scroll story flipbook */}
        <div className="order-3 lg:order-3">
          <Defer minHeight={480} noDefer>
            <ScrollStory />
          </Defer>
        </div>

        {/* 4 Sports hub */}
        <div className="order-5 lg:order-4">
          <Defer minHeight={400}>
            <SportsHub />
          </Defer>
        </div>

        {/* 5 Map hero */}
        <div className="order-6 lg:order-5">
          <Defer minHeight={560}>
            <MapHeroSection />
          </Defer>
        </div>

        {/* 6 Coaches marketplace */}
        <div className="order-7 lg:order-6">
          <Defer minHeight={480}>
            <FeaturedCoaches />
          </Defer>
        </div>

        {/* 7 How it works */}
        <div className="order-8 lg:order-7">
          <Defer minHeight={320}>
            <HowItWorks />
          </Defer>
        </div>

        {/* 8 Readiness science */}
        <div className="order-9 lg:order-8">
          <Defer minHeight={360}>
            <ScienceAndTech />
          </Defer>
        </div>

        {/* 9 App demo */}
        <div className="order-10 lg:order-9">
          <Defer minHeight={520} noDefer>
            <AppDemoSection />
          </Defer>
        </div>

        {/* 10 Social proof */}
        <div className="order-11 lg:order-10">
          <Defer minHeight={480}>
            <SocialProofSection />
          </Defer>
        </div>

        {/* 12 FAQ */}
        <div className="order-12">
          <Defer minHeight={400}>
            <Faqs />
          </Defer>
        </div>

        {/* 13 Download */}
        <div className="order-13">
          <DownloadSection />
        </div>
      </main>
      <Footer />
    </>
  );
}
