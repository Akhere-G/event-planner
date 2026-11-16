import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { articleCategoryPath } from "../lib/urls";
import { ArticleCard } from "./components/ArticleCard";
import { articleCategories, travelArticles } from "./index";

export const metadata: Metadata = {
  title: "Travel articles, destination comparisons and planning advice",
  description:
    "Useful travel-planning articles and balanced destination comparisons, connected to free TripTrack travel guides and itinerary templates.",
  alternates: { canonical: "/articles" },
  openGraph: {
    type: "website",
    title: "Travel articles and planning advice",
    description:
      "Practical trip-planning methods and destination comparisons from TripTrack.",
    url: "/articles",
  },
};

export default function ArticlesPage() {
  return (
    <div className="min-h-screen bg-canvas font-outfit">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 md:px-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-primary">
          TripTrack travel articles
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-text-primary md:text-5xl">
          Choose a destination, then make the trip work
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-text-secondary">
          Researched comparisons and practical planning advice, with direct links to
          destination guides and itinerary templates when you are ready to organise
          the details.
        </p>
        <nav aria-label="Article categories" className="mt-8 flex flex-wrap gap-3">
          {articleCategories.map((category) => (
            <Link
              key={category.slug}
              href={articleCategoryPath(category.slug)}
              className="rounded-full border border-surface-border bg-surface px-5 py-2.5 font-medium text-text-primary transition-colors hover:border-brand-primary"
            >
              {category.label}
            </Link>
          ))}
        </nav>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {travelArticles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
