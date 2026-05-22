"use client";

import dynamic from "next/dynamic";
import { HeroCinematic } from "@/components/landing/hero-cinematic";
import { TrustEditorial } from "@/components/landing/trust-editorial";
import { SectionBreak } from "@/components/landing/section-break";
import { CoachReel } from "@/components/landing/coach-reel";
import { PullQuote } from "@/components/landing/pull-quote";
import { FeatureManifesto } from "@/components/landing/feature-manifesto";
import { FinalCta } from "@/components/landing/final-cta";
import { LandingShell } from "@/components/landing/landing-shell";
import { LazyInView } from "@/components/marketing/lazy-in-view";
import { DownloadSection } from "@/components/marketing/download-section";
import { useLocale } from "@/lib/i18n-provider";

const Pricing = dynamic(
  () => import("@/components/pricing").then((m) => m.Pricing),
  { loading: () => <section className="mx-auto h-[480px] max-w-7xl skeleton" aria-hidden /> }
);

const Faqs = dynamic(
  () => import("@/components/faqs").then((m) => m.Faqs),
  { loading: () => <section className="mx-auto h-[400px] max-w-7xl skeleton" aria-hidden /> }
);

const ScienceAndTech = dynamic(
  () =>
    import("@/components/marketing/science-and-tech").then((m) => m.ScienceAndTech),
  { loading: () => <section className="mx-auto h-[360px] max-w-7xl skeleton" aria-hidden /> }
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

export function LandingPageContent() {
  const { landingEditorial: copy } = useLocale();
  const sb = copy.sectionBreak;
  const q = copy.quotes;

  return (
    <LandingShell>
      <HeroCinematic />
      <TrustEditorial />
      <SectionBreak lineOne={sb.connect} lineTwo={sb.perform} />
      <CoachReel />
      <PullQuote text={q.athlete.text} attribution={q.athlete.attribution} />
      <SectionBreak lineOne={sb.train} lineTwo={sb.smarter} />
      <FeatureManifesto />
      <PullQuote text={q.coach.text} attribution={q.coach.attribution} />
      <SectionBreak lineOne={sb.track} lineTwo={sb.everyMove} />
      <Defer minHeight={360}>
        <ScienceAndTech />
      </Defer>
      <SectionBreak lineOne={sb.book} lineTwo={sb.yourCoach} />
      <FinalCta />
      <Defer minHeight={480}>
        <Pricing />
      </Defer>
      <Defer minHeight={400}>
        <Faqs />
      </Defer>
      <DownloadSection />
    </LandingShell>
  );
}
