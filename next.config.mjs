import withPWAInit from "@ducanh2912/next-pwa";
import { pwaInitOptions } from "./lib/pwa/config.mjs";

const withPWA = withPWAInit(pwaInitOptions);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" }
    ]
  },
  async rewrites() {
    return [
      {
        source: "/manifest.webmanifest",
        destination: "/manifest.webmanifest",
      },
    ];
  },
  pwa: {
    disable: process.env.NODE_ENV !== "production",
  },
};

export default withPWA(nextConfig);
