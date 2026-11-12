import type { MetadataRoute } from "next";
import { destinationGuides } from "./destinations/guides";
import { guidePath, SITE_URL } from "./lib/urls";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;
  const guideEntries: MetadataRoute.Sitemap = [];
  for (const guide of destinationGuides) {
    guideEntries.push({
      url: `${baseUrl}${guidePath(guide.slug)}`,
      lastModified: new Date(guide.publishedAt),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/trip-planner`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/itinerary-planner`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ai-travel-planner`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/destinations`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...guideEntries,
  ];
}
