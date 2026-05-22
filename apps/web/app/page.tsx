import dynamic from "next/dynamic";
import { LandingPageContent } from "@/components/landing/landing-page-content";

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
    operatingSystem: "Web, iOS, Android",
    offers: { "@type": "Offer", price: "12", priceCurrency: "EUR" }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPageContent />
      <Footer />
    </>
  );
}
