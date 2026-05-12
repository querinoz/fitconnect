import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

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
  openGraph: {
    title: "FitConnect — Train with world-class specialists",
    description:
      "Discover, book and train with the best specialised personal trainers in the world.",
    type: "website"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable} dark`}>
      <body className="min-h-screen antialiased font-sans">{children}</body>
    </html>
  );
}
