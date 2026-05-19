import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SkipLink } from "@/components/skip-link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  adjustFontFallback: true
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "optional",
  preload: false,
  adjustFontFallback: true,
  weight: ["500", "600", "700"]
});

export const metadata: Metadata = {
  title: "FitConnect — Train with world-class specialists",
  description:
    "Connect with elite personal trainers for any sport you love. Yoga, surf, climbing, MMA and more — in person or online.",
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
    title: "FitConnect — Train with world-class specialists",
    description:
      "Discover, book and train with the best specialised personal trainers in the world.",
    type: "website"
  }
};

export const viewport: Viewport = {
  themeColor: [{ color: "#07080A" }],
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${display.variable} dark`}
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
            __html: `(function(){try{document.documentElement.dataset.motion="full";}catch(e){}})();`
          }}
        />
      </head>
      <body className="min-h-screen antialiased font-sans">
        <Providers>
          <SkipLink />
          {children}
        </Providers>
      </body>
    </html>
  );
}