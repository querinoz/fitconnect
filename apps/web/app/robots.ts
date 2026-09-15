import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/ios/install"] }
    ],
    sitemap: "https://fitconnect.querinoz.dev/sitemap.xml"
  };
}
