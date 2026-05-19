import withPWAInit from "@ducanh2912/next-pwa";
import { pwaInitOptions } from "./lib/pwa/config.mjs";

const withPWA = withPWAInit(pwaInitOptions);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "recharts",
      "@radix-ui/react-tabs"
    ]
  },
  transpilePackages: [
    "@fitconnect/types",
    "@fitconnect/utils",
    "@fitconnect/api-client",
    "@fitconnect/design-tokens",
    "@fitconnect/maps",
    "@fitconnect/ai"
  ],
  allowedDevOrigins: ["*.trycloudflare.com"],
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
