import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { FeatureCard } from "./components/FeatureCard";
import { featurePages } from "./index";

export const metadata: Metadata = {
  title: "Features for planning group trips",
  description:
    "Every TripTrack feature for group trips: shared itineraries, roles, expense splitting, wishlist voting, maps, flights, calendars and AI suggestions you approve.",
  alternates: { canonical: "/features" },
  openGraph: {
    type: "website",
    title: "TripTrack features for group trips",
    description:
      "Plan city breaks, stag and hen dos and birthday trips together, minus the group chat chaos.",
    url: "/features",
  },
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-canvas font-outfit">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 md:px-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-primary">
          TripTrack features
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-text-primary md:text-5xl">
          Group trips, minus the group chat chaos
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-text-secondary">
          Everything the organiser needs for a city break, stag or hen do, or birthday
          weekend: one shared plan, a fair way to split costs, and AI suggestions that
          only change the trip when you approve them.
        </p>
        <p className="mt-4 text-text-secondary">
          Got a question first?{" "}
          <Link href="/faq" className="font-medium text-brand-primary underline">
            Read the FAQ
          </Link>
          .
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featurePages.map((feature) => (
            <FeatureCard key={feature.slug} feature={feature} />
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
