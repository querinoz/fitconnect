import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://fitconnect.querinoz.dev";
  const now = new Date();
  const pages = [
    { url: base, priority: 1, changeFrequency: "weekly" as const },
    { url: `${base}/mobile`, priority: 0.9, changeFrequency: "monthly" as const },
    { url: `${base}/discover`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${base}/pricing`, priority: 0.85, changeFrequency: "monthly" as const },
    { url: `${base}/methodology`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${base}/programs`, priority: 0.7, changeFrequency: "weekly" as const },
    { url: `${base}/community`, priority: 0.6, changeFrequency: "weekly" as const },
    { url: `${base}/trainer`, priority: 0.75, changeFrequency: "monthly" as const },
    { url: `${base}/signup`, priority: 0.7, changeFrequency: "monthly" as const }
  ];

  return pages.map((p) => ({
    url: p.url,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority
  }));
}
