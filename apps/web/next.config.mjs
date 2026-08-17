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
      "motion",
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
    "@fitconnect/maps",
  ],
  allowedDevOrigins: ["*.trycloudflare.com"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)"
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload"
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https: wss:; worker-src 'self' blob:; child-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
          }
        ]
      }
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "ik.imagekit.io" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" }
    ],
    ...(process.env.NEXT_PUBLIC_IMAGEKIT_URL
      ? {
          loader: "custom",
          loaderFile: "./lib/media/imagekit-loader.ts"
        }
      : {})
  },
};

export default withPWA(nextConfig);
