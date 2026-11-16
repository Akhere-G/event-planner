import type { MetadataRoute } from "next";
import { destinationGuides } from "./destinations/guides";
import { articleCategories, travelArticles } from "./articles";
import {
  articleCategoryPath,
  articlePath,
  guidePath,
  SITE_URL,
} from "./lib/urls";

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

  const articleEntries: MetadataRoute.Sitemap = [];
  for (const article of travelArticles) {
    articleEntries.push({
      url: `${baseUrl}${articlePath(article.slug)}`,
      lastModified: new Date(article.updatedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  const categoryEntries: MetadataRoute.Sitemap = [];
  for (const category of articleCategories) {
    categoryEntries.push({
      url: `${baseUrl}${articleCategoryPath(category.slug)}`,
      lastModified: new Date("2026-11-16"),
      changeFrequency: "weekly",
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
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date("2026-11-16"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...guideEntries,
    ...categoryEntries,
    ...articleEntries,
  ];
}
