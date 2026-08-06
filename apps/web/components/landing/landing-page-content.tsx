"use client";

import dynamic from "next/dynamic";
import { useLocale } from "@/lib/i18n-provider";
import { LandingShellV2 } from "@/components/landing/landing-shell-v2";
import { LazyInView } from "@/components/marketing/lazy-in-view";
import { DownloadSection } from "@/components/marketing/download-section";
import { HeroEliteOs } from "@/components/marketing/landing-v2/hero-elite-os";
import { TrustStripMarquee } from "@/components/marketing/landing-v2/trust-strip-marquee";
import { ScrollStory } from "@/components/marketing/landing-v2/scroll-story";
import { MapHeroSection } from "@/components/marketing/landing-v2/map-hero-section";
import { SportsHub } from "@/components/marketing/landing-v2/sports-hub";
import { SocialProofSection } from "@/components/marketing/landing-v2/social-proof-section";
import { FeatureManifesto } from "@/components/landing/feature-manifesto";
import { CinematicBreak } from "@/components/landing/cinematic-break";
import { CoachReel } from "@/components/landing/coach-reel";
import { PullQuote } from "@/components/landing/pull-quote";
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

/** Elite OS landing — 9-act cinematic narrative (Voltline OS v2). */
export function LandingPageContent() {
  const { sectionBreak: sb, quotes } = useLocale().landingEditorial;

  return (
    <LandingShellV2 withBootGate>
      {/* Act I–II: Boot gate + Hero */}
      <HeroEliteOs />

      {/* Act III: Trust marquee */}
      <TrustStripMarquee />

      {/* Act IV: Section break — CONNECT / PERFORM */}
      <CinematicBreak lineOne={sb.connect} lineTwo={sb.perform} />

      {/* Act V: Coach filmstrip */}
      <CoachReel />

      {/* Act VI: Pull quote — athlete */}
      <PullQuote text={quotes.athlete.text} attribution={quotes.athlete.attribution} />

      {/* Act IV: TRAIN SMARTER */}
      <CinematicBreak lineOne={sb.train} lineTwo={sb.smarter} />

      <Defer minHeight={720}>
        <AppDemoSection />
      </Defer>

      <ScrollStory />

      {/* Act IV: TRACK EVERY MOVE */}
      <CinematicBreak lineOne={sb.track} lineTwo={sb.everyMove} />

      <div id="manifesto">
        <FeatureManifesto />
      </div>

      {/* Act VI: Pull quote — coach */}
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

      {/* Act IV: BOOK YOUR COACH */}
      <CinematicBreak lineOne={sb.book} lineTwo={sb.yourCoach} />

      <Defer minHeight={480}>
        <Pricing />
      </Defer>

      {/* Act IX: Final CTA aurora */}
      <FinalCta />

      <Defer minHeight={400}>
        <Faqs />
      </Defer>
      <DownloadSection />
    </LandingShellV2>
  );
}
