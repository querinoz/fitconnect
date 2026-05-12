import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
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

export default function Home() {
  return (
    <>
      <DemoBanner />
      <Nav />
      <main id="main">
        <Hero />
        <PressStrip />
        <SportsStrip />
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
