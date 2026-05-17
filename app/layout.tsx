import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n-provider";
import { AuthStoreProvider } from "@/components/auth-store-provider";
import { SkipLink } from "@/components/skip-link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

export const metadata: Metadata = {
  title: "FitConnect — Train with world-class specialists",
  description:
    "Connect with elite personal trainers for any sport you love. Yoga, surf, climbing, MMA and more — in person or online.",
  metadataBase: new URL("https://fitconnect.querinoz.dev"),
  applicationName: "FitConnect",
  manifest: "/manifest.webmanifest",
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
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
    { media: "(prefers-color-scheme: light)", color: "#22d3ee" }
  ],
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
      data-motion="full"
      className={`${inter.variable} ${display.variable} dark`}
    >
      <body className="min-h-screen antialiased font-sans">
        <MotionConfig reducedMotion="user">
          <LanguageProvider>
            <AuthStoreProvider>
              <SkipLink />
              {children}
            </AuthStoreProvider>
          </LanguageProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
