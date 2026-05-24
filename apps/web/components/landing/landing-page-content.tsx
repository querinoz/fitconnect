"use client";

import dynamic from "next/dynamic";
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
import { FinalCta } from "@/components/landing/final-cta";

const AppDemoSection = dynamic(
  () =>
    import("@/components/marketing/landing-v2/app-demo-section").then((m) => m.AppDemoSection),
  { loading: () => <section className="mx-auto h-[720px] max-w-7xl skeleton" aria-hidden id="demo" /> }
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

/** Elite OS landing — landing-v2 sections wired to production home. */
export function LandingPageContent() {
  return (
    <LandingShellV2>
      <HeroEliteOs />
      <TrustStripMarquee />
      <Defer minHeight={720}>
        <AppDemoSection />
      </Defer>
      <ScrollStory />
      <div id="manifesto">
        <FeatureManifesto />
      </div>
      <Defer minHeight={400}>
        <MapHeroSection />
      </Defer>
      <Defer minHeight={360}>
        <SportsHub />
      </Defer>
      <Defer minHeight={400}>
        <SocialProofSection />
      </Defer>
      <Defer minHeight={480}>
        <Pricing />
      </Defer>
      <FinalCta />
      <Defer minHeight={400}>
        <Faqs />
      </Defer>
      <DownloadSection />
    </LandingShellV2>
  );
}
