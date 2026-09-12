import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans, Syne } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SkipLink } from "@/components/skip-link";
import { ModalSlot } from "@/components/shell/modal-slot";
import { DEFAULT_LANG, SUPPORTED_LANGS, dict, type Lang } from "@/lib/i18n";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://fitconnect-phi.vercel.app";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  weight: ["400", "500", "600", "700"]
});

const display = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "optional",
  preload: true,
  adjustFontFallback: true,
  weight: ["600", "700", "800"]
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
  weight: ["400", "500", "700"]
});

const LOCALE_MAP: Record<string, string> = {
  en: "en_US",
  pt: "pt_PT",
  es: "es_ES",
  fr: "fr_FR",
  de: "de_DE",
  it: "it_IT"
};

function buildMetadata(lang: Lang): Metadata {
  const meta = dict[lang].meta;
  const langAlternates = Object.fromEntries(
    SUPPORTED_LANGS.map((code) => [code, `${SITE_URL}?lang=${code}`])
  ) as Record<string, string>;

  return {
    title: meta.title,
    description: meta.description,
    metadataBase: new URL(SITE_URL),
    applicationName: "FitConnect",
    manifest: "/app.webmanifest",
    appleWebApp: {
      capable: true,
      title: "FitConnect",
      statusBarStyle: "black-translucent"
    },
    icons: {
      icon: [
        { url: "/brand/fitconnect-logo-256.png", sizes: "256x256", type: "image/png" },
        { url: "/favicon.svg", type: "image/svg+xml" }
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
    },
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      type: "website",
      url: SITE_URL,
      locale: LOCALE_MAP[lang] ?? "en_US",
      images: [{ url: "/brand/fitconnect-logo-512.png", width: 512, height: 512, alt: "FitConnect" }]
    },
    twitter: {
      card: "summary_large_image",
      title: meta.ogTitle,
      description: meta.twitterDescription,
      images: ["/brand/fitconnect-logo-512.png"]
    },
    alternates: {
      canonical: SITE_URL,
      languages: {
        ...langAlternates,
        "x-default": SITE_URL
      }
    },
    robots: { index: true, follow: true }
  };
}

/**
 * Static metadata — do not await cookies()/headers() here.
 * Async generateMetadata streams these tags after </head>, which is what put
 * description/canonical/OG into <body> and failed the SEO gate.
 */
export const metadata: Metadata = buildMetadata(DEFAULT_LANG);

export const viewport: Viewport = {
  themeColor: [{ color: "#070B14" }],
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({
  children,
  modal
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html
      lang={DEFAULT_LANG}
      className={`${sans.variable} ${display.variable} ${mono.variable} dark`}
      suppressHydrationWarning
    >
      {/*
        NO MANUAL <head> HERE -- ON PURPOSE.

        This layout used to render its own <head> wrapping the two inline scripts below.
        In the App Router that breaks the Metadata API: Next streams the tags from
        generateMetadata() into the document, and when a hand-written <head> closes the
        element first, every one of those tags is emitted AFTER </head> and lands inside
        <body>.

        Measured on the live deployment 2026-09-12: </head> closed at character 3,358 and
        <meta name="description"> appeared at character 89,611 -- along with the canonical
        link, robots, the web manifest, all seven hreflang alternates, and the whole
        Open Graph and Twitter card block. 28 tags, all outside <head>.

        Consequences beyond a score: Lighthouse reported "Document does not have a meta
        description" (SEO 91), and any crawler or social unfurler that only parses <head>
        -- which is most of them -- saw no description, no canonical and no OG image.

        Moving these two scripts to the top of <body> fixes it. Both only touch
        document.documentElement, and as the first children of <body> they still execute
        before any content paints, so there is no flash of unstyled motion.

        Verified: serving the page with these tags relocated into <head> takes Lighthouse
        SEO from 91 to 100, with meta-description the only audit that changed.
      */}
      <body className="min-h-dvh w-full max-w-[100vw] overflow-x-clip antialiased font-sans">
        {process.env.NODE_ENV === "development" ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{if(!("serviceWorker"in navigator))return;navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(x){x.unregister()})});if("caches"in window){caches.keys().then(function(k){k.forEach(function(n){caches.delete(n)})})}}catch(e){}})();`
            }}
          />
        ) : null}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var langs=['en','pt','es','fr','de','it'];var l=localStorage.getItem('fitconnect.lang');if(l&&langs.indexOf(l)>=0){document.documentElement.lang=l;}var m=localStorage.getItem('fitconnect:motion');var os=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(m==='reduced'){document.documentElement.dataset.motion='reduced';}else if(m==='full'){document.documentElement.dataset.motion='full';}else{document.documentElement.dataset.motion=os?'reduced':'full';}document.documentElement.dataset.colorMode='dark';}catch(e){document.documentElement.dataset.motion='full';}})();`
          }}
        />
        <Providers initialLang={DEFAULT_LANG}>
          <SkipLink />
          {children}
          <ModalSlot>{modal}</ModalSlot>
        </Providers>
      </body>
    </html>
  );
}
