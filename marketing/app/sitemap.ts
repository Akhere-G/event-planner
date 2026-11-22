import type { MetadataRoute } from "next";
import { destinationGuides } from "./destinations/guides";
import { articleCategories, travelArticles } from "./articles";
import { featurePages, featurePath } from "./features";
import {
  articleCategoryPath,
  articlePath,
  guidePath,
  SITE_URL,
} from "./lib/urls";

const CONTENT_UPDATED_AT = new Date("2026-11-22");

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

  const featureEntries: MetadataRoute.Sitemap = [];
  for (const feature of featurePages) {
    featureEntries.push({
      url: `${baseUrl}${featurePath(feature.slug)}`,
      lastModified: CONTENT_UPDATED_AT,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  const categoryEntries: MetadataRoute.Sitemap = [];
  for (const category of articleCategories) {
    categoryEntries.push({
      url: `${baseUrl}${articleCategoryPath(category.slug)}`,
      lastModified: CONTENT_UPDATED_AT,
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
      url: `${baseUrl}/features`,
      lastModified: CONTENT_UPDATED_AT,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: CONTENT_UPDATED_AT,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/destinations`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: CONTENT_UPDATED_AT,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...featureEntries,
    ...guideEntries,
    ...categoryEntries,
    ...articleEntries,
  ];
}
