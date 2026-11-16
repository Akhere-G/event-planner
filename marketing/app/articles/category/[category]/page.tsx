import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "../../../components/SiteChrome";
import { articleCategoryPath } from "../../../lib/urls";
import { ArticleCard } from "../../components/ArticleCard";
import {
  articleCategories,
  getArticleCategory,
  getArticlesByCategory,
} from "../../index";
import type { ArticleCategorySlug } from "../../types";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return articleCategories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = getArticleCategory(categorySlug);
  if (!category) {
    return {};
  }
  return {
    title: `${category.label} articles`,
    description: category.description,
    alternates: { canonical: articleCategoryPath(category.slug) },
    openGraph: {
      type: "website",
      title: `${category.label} articles`,
      description: category.description,
      url: articleCategoryPath(category.slug),
    },
  };
}

export default async function ArticleCategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const category = getArticleCategory(categorySlug);
  if (!category) {
    notFound();
  }
  const articles = getArticlesByCategory(category.slug as ArticleCategorySlug);

  return (
    <div className="min-h-screen bg-canvas font-outfit">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 md:px-8">
        <Link href="/articles" className="text-sm font-medium text-brand-primary underline">
          All travel articles
        </Link>
        <h1 className="mt-4 text-4xl font-semibold text-text-primary md:text-5xl">
          {category.label}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-text-secondary">
          {category.description}
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
