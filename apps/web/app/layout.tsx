import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Syne } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SkipLink } from "@/components/skip-link";

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

export const metadata: Metadata = {
  title: "FitConnect — Treina com especialistas de elite",
  description:
    "Marketplace de coaches verificados com Readiness IA, sync Strava e sessões ao vivo. Yoga, surf, escalada, MMA e mais — presencial ou online.",
  metadataBase: new URL("https://fitconnect.querinoz.dev"),
  applicationName: "FitConnect",
  manifest: "/app.webmanifest",
  appleWebApp: {
    capable: true,
    title: "FitConnect",
    statusBarStyle: "black-translucent"
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" }]
  },
  openGraph: {
    title: "FitConnect — Treina com especialistas de elite",
    description:
      "Descobre, reserva e treina com os melhores personal trainers especializados do mundo.",
    type: "website",
    url: "https://fitconnect.querinoz.dev",
    locale: "pt_PT",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "FitConnect" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "FitConnect — Treina com especialistas de elite",
    description:
      "Coaches de elite para qualquer desporto. Readiness IA, Strava sync e intro grátis de 15 min.",
    images: ["/og-image.svg"]
  },
  alternates: {
    canonical: "https://fitconnect.querinoz.dev"
  },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  themeColor: [{ color: "#07080B" }],
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt"
      className={`${sans.variable} ${display.variable} dark`}
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
            __html: `(function(){try{document.documentElement.dataset.motion="full";document.documentElement.dataset.colorMode="dark";}catch(e){}})();`
          }}
        />
      </head>
      <body className="min-h-dvh w-full max-w-[100vw] overflow-x-clip antialiased font-sans">
        <Providers>
          <SkipLink />
          {children}
        </Providers>
      </body>
    </html>
  );
}
