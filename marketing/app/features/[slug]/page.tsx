import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArticleSection,
  CheckList,
  ProductScreenshot,
  TripTrackCta,
} from "../../articles/components/ArticleElements";
import { getArticle } from "../../articles/index";
import type { TravelArticle } from "../../articles/types";
import { SiteFooter, SiteHeader } from "../../components/SiteChrome";
import { articlePath, SITE_URL } from "../../lib/urls";
import { FeatureCard } from "../components/FeatureCard";
import { JsonLd } from "../components/JsonLd";
import { featurePages, featurePath, getFeature } from "../index";
import type { FeaturePage } from "../types";

interface FeatureRouteProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return featurePages.map((feature) => ({ slug: feature.slug }));
}

export async function generateMetadata({
  params,
}: FeatureRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const feature = getFeature(slug);
  if (!feature) {
    return {};
  }
  const path = featurePath(feature.slug);
  const [screenshot] = feature.screenshots;
  return {
    title: feature.title,
    description: feature.description,
    keywords: [feature.primaryKeyword, ...feature.secondaryKeywords],
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      title: feature.title,
      description: feature.description,
      images: [{ url: screenshot.src, alt: screenshot.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: feature.title,
      description: feature.description,
      images: [screenshot.src],
    },
  };
}

function structuredData(feature: FeaturePage) {
  const pageUrl = `${SITE_URL}${featurePath(feature.slug)}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: feature.title,
      description: feature.description,
      url: pageUrl,
      inLanguage: "en-GB",
      primaryImageOfPage: `${SITE_URL}${feature.screenshots[0].src}`,
      keywords: [feature.primaryKeyword, ...feature.secondaryKeywords],
      publisher: { "@type": "Organization", name: "TripTrack" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Features",
          item: `${SITE_URL}/features`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: feature.name,
          item: pageUrl,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: feature.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ];
}

function relatedFeatures(feature: FeaturePage): FeaturePage[] {
  const related: FeaturePage[] = [];
  for (const slug of feature.relatedFeatureSlugs) {
    const match = getFeature(slug);
    if (match) {
      related.push(match);
    }
  }
  return related;
}

function relatedArticles(feature: FeaturePage): TravelArticle[] {
  const related: TravelArticle[] = [];
  for (const slug of feature.relatedArticleSlugs) {
    const match = getArticle(slug);
    if (match) {
      related.push(match);
    }
  }
  return related;
}

export default async function FeatureRoute({ params }: FeatureRouteProps) {
  const { slug } = await params;
  const feature = getFeature(slug);
  if (!feature) {
    notFound();
  }
  const [firstScreenshot, secondScreenshot] = feature.screenshots;
  const articles = relatedArticles(feature);

  return (
    <div className="min-h-screen bg-canvas font-outfit">
      <SiteHeader />
      <JsonLd data={structuredData(feature)} />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-28 md:px-8">
        <nav aria-label="Breadcrumb" className="text-sm text-text-secondary">
          <Link href="/features" className="underline">Features</Link>
          <span aria-hidden="true"> / </span>
          <span>{feature.name}</span>
        </nav>
        <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-brand-primary">
          {feature.name}
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight text-text-primary md:text-5xl">
          {feature.title}
        </h1>
        <p className="mt-5 text-lg leading-8 text-text-secondary">{feature.summary}</p>

        <ProductScreenshot {...firstScreenshot} />

        <ArticleSection id="how-it-works" title="How it works">
          <ol className="list-decimal space-y-4 pl-6 marker:font-semibold marker:text-brand-primary">
            {feature.steps.map((step) => (
              <li key={step.title}>
                <strong className="text-text-primary">{step.title}.</strong> {step.body}
              </li>
            ))}
          </ol>
        </ArticleSection>

        {secondScreenshot ? <ProductScreenshot {...secondScreenshot} /> : null}

        <ArticleSection id="group-trips" title="Why it helps on group trips">
          <CheckList>
            {feature.benefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </CheckList>
        </ArticleSection>

        <ArticleSection id="limits" title="What it doesn't do">
          <CheckList>
            {feature.limits.map((limit) => (
              <li key={limit}>{limit}</li>
            ))}
          </CheckList>
        </ArticleSection>

        <ArticleSection id="faq" title="Questions">
          <dl className="space-y-6">
            {feature.faqs.map((faq) => (
              <div key={faq.question}>
                <dt className="font-semibold text-text-primary">{faq.question}</dt>
                <dd className="mt-2">{faq.answer}</dd>
              </div>
            ))}
          </dl>
          <p>
            More answers in the{" "}
            <Link href="/faq" className="font-medium text-brand-primary underline">
              TripTrack FAQ
            </Link>
            .
          </p>
        </ArticleSection>

        {articles.length > 0 ? (
          <ArticleSection id="further-reading" title="Further reading">
            <ul className="space-y-2">
              {articles.map((article) => (
                <li key={article.slug}>
                  <Link
                    href={articlePath(article.slug)}
                    className="font-medium text-brand-primary underline"
                  >
                    {article.title}
                  </Link>
                </li>
              ))}
            </ul>
          </ArticleSection>
        ) : null}

        <TripTrackCta title="Plan your next group trip in one place">
          Start with a sentence or a template, invite the group, and keep the plan,
          the map and the costs together.
        </TripTrackCta>
      </main>
      <aside className="border-t border-surface-border bg-surface-muted px-4 py-16 md:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-semibold text-text-primary">Related features</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedFeatures(feature).map((related) => (
              <FeatureCard key={related.slug} feature={related} />
            ))}
          </div>
          <p className="mt-8">
            <Link href="/features" className="font-medium text-brand-primary underline">
              See all features
            </Link>
          </p>
        </div>
      </aside>
      <SiteFooter />
    </div>
  );
}
