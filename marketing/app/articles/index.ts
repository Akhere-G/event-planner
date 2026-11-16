import { howToCreateTravelItineraryArticle } from "./content/how-to-create-travel-itinerary";
import { parisVsAmsterdamArticle } from "./content/paris-vs-amsterdam";
import { pragueVsBudapestArticle } from "./content/prague-vs-budapest";
import { tokyoVsSeoulArticle } from "./content/tokyo-vs-seoul";
import { travelPlanningChecklistArticle } from "./content/travel-planning-checklist";
import type { ArticleCategorySlug, TravelArticle } from "./types";

export const travelArticles: TravelArticle[] = [
  howToCreateTravelItineraryArticle,
  travelPlanningChecklistArticle,
  parisVsAmsterdamArticle,
  tokyoVsSeoulArticle,
  pragueVsBudapestArticle,
];

export const articleCategories: {
  slug: ArticleCategorySlug;
  label: string;
  description: string;
}[] = [
  {
    slug: "destination-comparisons",
    label: "Destination comparisons",
    description:
      "Balanced, like-for-like comparisons to help you choose where to travel next.",
  },
  {
    slug: "travel-planning",
    label: "Travel planning",
    description:
      "Practical methods and checklists for turning an idea into an organised trip.",
  },
];

export function getArticle(slug: string): TravelArticle | undefined {
  return travelArticles.find((article) => article.slug === slug);
}

export function getArticleCategory(categorySlug: string) {
  return articleCategories.find((category) => category.slug === categorySlug);
}

export function getArticlesByCategory(categorySlug: ArticleCategorySlug) {
  return travelArticles.filter((article) => article.categorySlug === categorySlug);
}
