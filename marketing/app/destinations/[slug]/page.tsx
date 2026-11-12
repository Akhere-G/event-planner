import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "../../components/SiteChrome";
import { PlaceSection } from "../components/PlaceSection";
import { TemplateLink } from "../components/TemplateLink";
import { destinationGuides, getGuide } from "../guides";
import { guidePath, SITE_URL } from "../../lib/urls";
import type { DestinationGuide } from "../types";

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return destinationGuides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) {
    return {};
  }
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: guidePath(guide.slug) },
    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.description,
      publishedTime: guide.publishedAt,
    },
  };
}

function articleJsonLd(guide: DestinationGuide) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: guide.publishedAt,
    dateModified: guide.publishedAt,
    inLanguage: "en-GB",
    mainEntityOfPage: `${SITE_URL}${guidePath(guide.slug)}`,
    author: { "@type": "Organization", name: "TripTrack" },
    publisher: { "@type": "Organization", name: "TripTrack" },
    about: { "@type": "Place", name: `${guide.city}, ${guide.country}` },
  };
}

export default async function DestinationGuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) {
    notFound();
  }

  return (
    <div className="min-h-screen font-outfit bg-slate-50">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd(guide)).replace(/</g, "\\u003c"),
        }}
      />
      <main className="max-w-3xl mx-auto px-4 md:px-8 pt-28 pb-20">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-primary">
          {guide.city}, {guide.country}
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl font-semibold text-slate-900 leading-tight">
          {guide.title}
        </h1>
        <div className="mt-6 space-y-4 text-lg text-slate-600 leading-relaxed">
          {guide.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <aside className="mt-8 rounded-2xl border border-brand-primary/30 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {guide.templateTitle}
          </h2>
          <p className="mt-1 text-slate-600">
            A free {guide.templateDays}-day {guide.city} itinerary with the
            restaurants, sights and places to stay from this guide. Copy it to
            your own dates and edit anything.
          </p>
          <TemplateLink
            guide={guide}
            label="See the template"
            className="mt-4 inline-block bg-brand-primary text-white font-semibold px-6 py-2.5 rounded-full hover:bg-brand-primary/90 transition-colors"
          />
        </aside>

        <section aria-labelledby="best-time" className="mt-14">
          <h2
            id="best-time"
            className="text-2xl md:text-3xl font-semibold text-slate-900"
          >
            Best time to visit {guide.city}
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed">
            {guide.bestTime}
          </p>
        </section>

        <PlaceSection
          id="restaurants"
          title={`Where to eat in ${guide.city}`}
          places={guide.restaurants}
        />
        <PlaceSection
          id="things-to-do"
          title={`Best things to do in ${guide.city}`}
          places={guide.thingsToDo}
        />
        <PlaceSection
          id="where-to-stay"
          title={`Where to stay in ${guide.city}`}
          places={guide.whereToStay}
        />
        <PlaceSection
          id="hidden-gems"
          title={`Hidden gems in ${guide.city}`}
          places={guide.hiddenGems}
        />

        <section className="mt-16 rounded-2xl bg-[#0F1419] p-8 text-center text-white">
          <h2 className="text-2xl font-semibold">
            Ready to plan your {guide.city} trip?
          </h2>
          <p className="mt-2 text-white/70">
            Copy the {guide.templateDays}-day template, pick your dates and
            share it with whoever is coming with you.
          </p>
          <TemplateLink
            guide={guide}
            label="See the template"
            className="mt-6 inline-block bg-brand-primary text-white font-semibold px-6 py-2.5 rounded-full hover:bg-brand-primary/90 transition-colors"
          />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
