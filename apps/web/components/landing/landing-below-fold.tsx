"use client";

import dynamic from "next/dynamic";
import { useLocale } from "@/lib/i18n-provider";
import { LazyInView } from "@/components/marketing/lazy-in-view";
import { DownloadSection } from "@/components/marketing/download-section";
import { TrustStripMarquee } from "@/components/marketing/landing-v2/trust-strip-marquee";
import { ScrollStory } from "@/components/marketing/landing-v2/scroll-story";
import { MapHeroSection } from "@/components/marketing/landing-v2/map-hero-section";
import { SportsHub } from "@/components/marketing/landing-v2/sports-hub";
import { SocialProofSection } from "@/components/marketing/landing-v2/social-proof-section";
import { FeatureManifesto } from "@/components/landing/feature-manifesto";
import { CinematicBreak } from "@/components/landing/cinematic-break";
import { CoachReel } from "@/components/landing/coach-reel";
import { PullQuote } from "@/components/landing/pull-quote";
import { LandingProblemAct } from "@/components/landing/landing-problem-act";
import { LandingEcosystemAct } from "@/components/landing/landing-ecosystem-act";
import { FinalCta } from "@/components/landing/final-cta";

const AppDemoSection = dynamic(
  () =>
    import("@/components/marketing/landing-v2/app-demo-section").then((m) => m.AppDemoSection),
  { loading: () => <section className="mx-auto h-[720px] max-w-7xl skeleton" aria-hidden id="demo" /> }
);

const ScienceAndTech = dynamic(
  () => import("@/components/marketing/science-and-tech").then((m) => m.ScienceAndTech),
  { loading: () => <section className="mx-auto h-[420px] max-w-7xl skeleton" aria-hidden /> }
);

const Pricing = dynamic(
  () => import("@/components/pricing").then((m) => m.Pricing),
  { loading: () => <section className="mx-auto h-[480px] max-w-7xl skeleton" aria-hidden /> }
);

const Faqs = dynamic(
  () => import("@/components/faqs").then((m) => m.Faqs),
  { loading: () => <section className="mx-auto h-[400px] max-w-7xl skeleton" aria-hidden /> }
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

/** Below-the-fold Elite OS landing acts — loaded after hero paint. */
export function LandingBelowFold() {
  const { sectionBreak: sb, quotes } = useLocale().landingEditorial;

  return (
    <>
      <TrustStripMarquee />

      <LandingProblemAct />

      <CinematicBreak lineOne={sb.connect} lineTwo={sb.perform} />

      <CoachReel />

      <PullQuote text={quotes.athlete.text} attribution={quotes.athlete.attribution} />

      <CinematicBreak lineOne={sb.train} lineTwo={sb.smarter} />

      <div id="demo">
        <Defer minHeight={720}>
          <AppDemoSection />
        </Defer>
      </div>

      <ScrollStory />

      <CinematicBreak lineOne={sb.track} lineTwo={sb.everyMove} />

      <div id="manifesto">
        <FeatureManifesto />
      </div>

      <PullQuote text={quotes.coach.text} attribution={quotes.coach.attribution} />

      <Defer minHeight={400}>
        <ScienceAndTech />
      </Defer>

      <Defer minHeight={400}>
        <MapHeroSection />
      </Defer>
      <Defer minHeight={360}>
        <SportsHub />
      </Defer>
      <Defer minHeight={400}>
        <SocialProofSection />
      </Defer>

      <CinematicBreak lineOne={sb.book} lineTwo={sb.yourCoach} />

      <div id="pricing">
        <Pricing />
      </div>

      <LandingEcosystemAct />

      <FinalCta />

      <Defer minHeight={400}>
        <Faqs />
      </Defer>
      <DownloadSection />
    </>
  );
}
