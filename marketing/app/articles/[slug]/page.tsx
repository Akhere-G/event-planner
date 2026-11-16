import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "../../components/SiteChrome";
import {
  articleCategoryPath,
  articlePath,
  SITE_URL,
} from "../../lib/urls";
import { ArticleCard } from "../components/ArticleCard";
import {
  GuideAndTemplateLinks,
  Sources,
} from "../components/ArticleElements";
import { getArticle, travelArticles } from "../index";
import type { TravelArticle } from "../types";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return travelArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) {
    return {};
  }
  const path = articlePath(article.slug);
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      title: article.title,
      description: article.description,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      images: [{ url: article.image.src, alt: article.image.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: [article.image.src],
    },
  };
}

function structuredData(article: TravelArticle) {
  const articleUrl = `${SITE_URL}${articlePath(article.slug)}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: article.title,
      description: article.description,
      image: `${SITE_URL}${article.image.src}`,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      inLanguage: "en-GB",
      mainEntityOfPage: articleUrl,
      author: { "@type": "Organization", name: "TripTrack" },
      publisher: { "@type": "Organization", name: "TripTrack" },
      keywords: article.primaryKeyword,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Articles",
          item: `${SITE_URL}/articles`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: article.categoryLabel,
          item: `${SITE_URL}${articleCategoryPath(article.categorySlug)}`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: article.title,
          item: articleUrl,
        },
      ],
    },
  ];
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) {
    notFound();
  }
  const related = travelArticles
    .filter(
      (candidate) =>
        candidate.slug !== article.slug &&
        candidate.categorySlug === article.categorySlug,
    )
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-canvas font-outfit">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData(article)).replace(/</g, "\\u003c"),
        }}
      />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-28 md:px-8">
        <nav aria-label="Breadcrumb" className="text-sm text-text-secondary">
          <Link href="/articles" className="underline">Articles</Link>
          <span aria-hidden="true"> / </span>
          <Link href={articleCategoryPath(article.categorySlug)} className="underline">
            {article.categoryLabel}
          </Link>
        </nav>
        <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-brand-primary">
          {article.categoryLabel}
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight text-text-primary md:text-5xl">
          {article.title}
        </h1>
        <p className="mt-4 text-sm text-text-secondary">
          Published 16 November 2026 · {article.readingMinutes} minute read
        </p>
        <figure className="mt-8">
          <Image
            src={article.image.src}
            alt={article.image.alt}
            width={article.image.width}
            height={article.image.height}
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 768px) 768px, 100vw"
            className="aspect-[16/9] w-full rounded-2xl object-cover"
          />
          <figcaption className="mt-2 text-xs text-text-secondary">
            Photo by{" "}
            <a
              href={`${article.image.credit.url}?utm_source=triptrack&utm_medium=referral`}
              className="underline"
              rel="noopener"
            >
              {article.image.credit.name}
            </a>{" "}
            on{" "}
            <a
              href="https://unsplash.com/?utm_source=triptrack&utm_medium=referral"
              className="underline"
              rel="noopener"
            >
              Unsplash
            </a>
          </figcaption>
        </figure>
        <article className="mt-8 [&>p]:mt-4 [&>p]:text-lg [&>p]:leading-8 [&>p]:text-text-secondary">
          <article.Content />
        </article>
        <GuideAndTemplateLinks slugs={article.relatedGuideSlugs} />
        <Sources sources={article.sources} />
      </main>
      {related.length > 0 ? (
        <aside className="border-t border-surface-border bg-surface-muted px-4 py-16 md:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl font-semibold text-text-primary">Related articles</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {related.map((candidate) => (
                <ArticleCard key={candidate.slug} article={candidate} />
              ))}
            </div>
          </div>
        </aside>
      ) : null}
      <SiteFooter />
    </div>
  );
}
