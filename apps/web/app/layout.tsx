import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans, Syne } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SkipLink } from "@/components/skip-link";
import { ModalSlot } from "@/components/shell/modal-slot";
import { SUPPORTED_LANGS } from "@/lib/i18n";
import { getDictionary, getServerLang } from "@/lib/i18n/server";

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
  display: "swap",
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

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getServerLang();
  const meta = getDictionary(lang).meta;
  const localeMap: Record<string, string> = {
    en: "en_US",
    pt: "pt_PT",
    es: "es_ES",
    fr: "fr_FR",
    de: "de_DE",
    it: "it_IT"
  };

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
      locale: localeMap[lang] ?? "en_US",
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

export const viewport: Viewport = {
  themeColor: [{ color: "#070B14" }],
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default async function RootLayout({
  children,
  modal
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const initialLang = await getServerLang();

  return (
    <html
      lang={initialLang}
      className={`${sans.variable} ${display.variable} ${mono.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        {process.env.NODE_ENV === "development" ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{if(!("serviceWorker"in navigator))return;navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(x){x.unregister()})});if("caches"in window){caches.keys().then(function(k){k.forEach(function(n){caches.delete(n)})})}}catch(e){}})();`
            }}
          />
        ) : null}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('fitconnect:motion');var os=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(m==='reduced'){document.documentElement.dataset.motion='reduced';}else if(m==='full'){document.documentElement.dataset.motion='full';}else{document.documentElement.dataset.motion=os?'reduced':'full';}document.documentElement.dataset.colorMode='dark';}catch(e){document.documentElement.dataset.motion='full';}})();`
          }}
        />
      </head>
      <body className="min-h-dvh w-full max-w-[100vw] overflow-x-clip antialiased font-sans">
        <Providers initialLang={initialLang}>
          <SkipLink />
          {children}
          <ModalSlot>{modal}</ModalSlot>
        </Providers>
      </body>
    </html>
  );
}
