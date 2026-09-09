import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app/", "/settings/", "/api/", "/login", "/register"],
    },
    sitemap: "https://triptrack.uk/sitemap.xml",
  };
}
