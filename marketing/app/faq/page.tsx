import type { Metadata } from "next";
import Link from "next/link";
import { TripTrackCta } from "../articles/components/ArticleElements";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { JsonLd } from "../features/components/JsonLd";
import { featurePath, getFeature } from "../features/index";
import { SITE_URL } from "../lib/urls";
import { type FaqEntry, faqGroups } from "./faqs";

export const metadata: Metadata = {
  title: "TripTrack FAQ: group trip planning questions answered",
  description:
    "Answers about planning group trips with TripTrack: invites and roles, AI proposals you approve, splitting costs in GBP, Google Calendar sync, flights and privacy.",
  alternates: { canonical: "/faq" },
  openGraph: {
    type: "website",
    title: "TripTrack FAQ",
    description:
      "How TripTrack handles group planning, AI suggestions, shared costs, calendars and privacy.",
    url: "/faq",
  },
};

function structuredData() {
  const questions = [];
  for (const group of faqGroups) {
    for (const entry of group.entries) {
      questions.push({
        "@type": "Question",
        name: entry.question,
        acceptedAnswer: { "@type": "Answer", text: entry.answer },
      });
    }
  }
  return [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      url: `${SITE_URL}/faq`,
      inLanguage: "en-GB",
      mainEntity: questions,
    },
  ];
}

function FeatureLinks({ entry }: { entry: FaqEntry }) {
  const links = [];
  for (const slug of entry.featureSlugs) {
    const feature = getFeature(slug);
    if (feature) {
      links.push(
        <Link
          key={slug}
          href={featurePath(slug)}
          className="font-medium text-brand-primary underline"
        >
          {feature.name}
        </Link>,
      );
    }
  }
  if (links.length === 0) {
    return null;
  }
  return (
    <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
      <span className="text-text-secondary">Read more:</span>
      {links}
    </p>
  );
}

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-canvas font-outfit">
      <SiteHeader />
      <JsonLd data={structuredData()} />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-28 md:px-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-primary">
          Frequently asked questions
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight text-text-primary md:text-5xl">
          TripTrack questions, answered
        </h1>
        <p className="mt-4 text-lg leading-8 text-text-secondary">
          How planning a group trip works in TripTrack, from inviting friends to
          splitting the bill. Each answer links to the feature page with more detail.
        </p>
        <nav aria-label="FAQ topics" className="mt-8 flex flex-wrap gap-3">
          {faqGroups.map((group) => (
            <a
              key={group.id}
              href={`#${group.id}`}
              className="rounded-full border border-surface-border bg-surface px-5 py-2.5 font-medium text-text-primary transition-colors hover:border-brand-primary"
            >
              {group.title}
            </a>
          ))}
        </nav>
        {faqGroups.map((group) => (
          <section key={group.id} aria-labelledby={group.id} className="mt-14">
            <h2
              id={group.id}
              className="scroll-mt-24 text-2xl font-semibold text-text-primary md:text-3xl"
            >
              {group.title}
            </h2>
            <dl className="mt-6 divide-y divide-surface-border rounded-2xl border border-surface-border bg-surface">
              {group.entries.map((entry) => (
                <div key={entry.question} className="p-6">
                  <dt className="text-lg font-semibold text-text-primary">
                    {entry.question}
                  </dt>
                  <dd className="mt-2 leading-7 text-text-secondary">
                    {entry.answer}
                    <FeatureLinks entry={entry} />
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
        <p className="mt-12 text-text-secondary">
          Want the full picture?{" "}
          <Link href="/features" className="font-medium text-brand-primary underline">
            See every feature
          </Link>
          .
        </p>
        <TripTrackCta title="Ready to plan the trip?">
          Start from a sentence or a template, invite the group and keep everything in
          one place.
        </TripTrackCta>
      </main>
      <SiteFooter />
    </div>
  );
}
