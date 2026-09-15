import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FitConnect",
    short_name: "FitConnect",
    description: "Coach × athlete training, live.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    background_color: "#070B14",
    theme_color: "#C8FF00",
    orientation: "portrait",
    categories: ["health", "fitness", "sports"],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        url: "/dashboard",
        description: "Athlete readiness and today’s plan"
      },
      {
        name: "Discover coaches",
        short_name: "Discover",
        url: "/discover",
        description: "Find verified coaches near you"
      },
      {
        name: "TRAIN",
        short_name: "TRAIN",
        url: "/train",
        description: "Guided workout discovery and live session"
      },
      {
        name: "Sessions",
        short_name: "Sessions",
        url: "/sessions",
        description: "Upcoming and live coach sessions"
      }
    ],
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
