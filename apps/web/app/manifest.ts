import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FitConnect",
    short_name: "FitConnect",
    description: "Coach × athlete training, live.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#090402",
    theme_color: "#bfee16",
    orientation: "portrait",
    icons: [
      {
        src: "/brand/fitconnect-logo-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/brand/fitconnect-logo-512.png",
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: "/brand/fitconnect-logo-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
