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
};

export default withPWA(nextConfig);
