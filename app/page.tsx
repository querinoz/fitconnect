import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { SportsStrip } from "@/components/sports-strip";
import { Features } from "@/components/features";
import { TrainersGrid } from "@/components/trainers-grid";
import { HowItWorks } from "@/components/how-it-works";
import { Pricing } from "@/components/pricing";
import { Faqs } from "@/components/faqs";
import { Cta } from "@/components/cta";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <SportsStrip />
        <Features />
        <TrainersGrid />
        <HowItWorks />
        <Pricing />
        <Faqs />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
