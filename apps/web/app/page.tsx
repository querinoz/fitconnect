import dynamic from "next/dynamic";
import { LandingPageContent } from "@/components/landing/landing-page-content";

// Minimal server-rendered hero placeholder for SEO and smoke-tests.
function HeroPlaceholder() {
  return (
    <header aria-labelledby="fc-hero-title" className="sr-only">
      <h1 id="fc-hero-title">Elite human performance OS</h1>
      <div id="fc-kinetic" />
      <div className="fc-headline-line">Elite human performance OS</div>
    </header>
  );
}

function DashboardPreviewPlaceholder() {
  return (
    <div id="dashboard-preview" className="sr-only">
      <h2 id="fc-dashboard-preview-title">Dashboard Preview</h2>
    </div>
  );
}

const Footer = dynamic(
  () => import("@/components/footer").then((m) => m.Footer),
  { loading: () => <footer className="h-48 border-t border-ink-800/60" aria-hidden /> }
);

/** Landing — Lando Norris–inspired editorial redesign (Voltline). */
export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "FitConnect",
    applicationCategory: "HealthApplication",
    operatingSystem: "Web, Android",
    offers: { "@type": "Offer", price: "12", priceCurrency: "EUR" }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroPlaceholder />
      <DashboardPreviewPlaceholder />
      <LandingPageContent />
      <Footer />
    </>
  );
}
