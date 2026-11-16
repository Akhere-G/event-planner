import type { ComponentType } from "react";
import type { GuideImage } from "../destinations/types";

export type ArticleCategorySlug =
  | "destination-comparisons"
  | "travel-planning";

export interface ArticleSource {
  title: string;
  url: string;
}

export interface TravelArticle {
  slug: string;
  categorySlug: ArticleCategorySlug;
  categoryLabel: string;
  title: string;
  description: string;
  excerpt: string;
  primaryKeyword: string;
  searchIntent: string;
  image: GuideImage;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  relatedGuideSlugs: string[];
  sources: ArticleSource[];
  Content: ComponentType;
}
