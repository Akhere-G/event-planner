import type { MetadataRoute } from "next";
import { blogPosts } from "./blog/posts";
import { postPath, SITE_URL } from "./lib/urls";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;
  const postEntries: MetadataRoute.Sitemap = [];
  for (const post of blogPosts) {
    postEntries.push({
      url: `${baseUrl}${postPath(post.slug)}`,
      lastModified: new Date(post.publishedAt),
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
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...postEntries,
  ];
}
