import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans, Syne } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SkipLink } from "@/components/skip-link";

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

const display = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: "FitConnect Elite OS — Train with world-class specialists",
  description:
    "The operating system for elite human performance. Connect with specialists, track telemetry, and perform at your peak.",
  metadataBase: new URL("https://fitconnect.querinoz.dev"),
  applicationName: "FitConnect",
  manifest: "/app.webmanifest",
  appleWebApp: {
    capable: true,
    title: "FitConnect",
    statusBarStyle: "black-translucent"
  },
  icons: {
    icon: [{ url: "/brand/logomark-official-64.png", type: "image/png" }],
    apple: [
      {
        url: "/brand/logomark-official-128.png",
        sizes: "180x180",
        type: "image/png"
      }
    ]
  },
  openGraph: {
    title: "FitConnect Elite OS",
    description:
      "The operating system for elite human performance.",
    type: "website"
  }
};

export const viewport: Viewport = {
  themeColor: [{ color: "#090402" }],
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
      className={`${body.variable} ${display.variable} ${mono.variable} dark`}
    >
      <body className="min-h-screen antialiased font-sans">
        <Providers>
          <SkipLink />
          {children}
        </Providers>
      </body>
    </html>
  );
}
