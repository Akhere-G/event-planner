import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { RegionGroups } from "./components/RegionGroups";

export const metadata: Metadata = {
  title: "Holiday destinations and ready-made trip templates",
  description:
    "Thirteen popular city break destinations across Asia, Europe and North America, each with a travel guide and a free itinerary template to copy and customise.",
  alternates: { canonical: "/destinations" },
};

export default function DestinationsPage() {
  return (
    <div className="min-h-screen font-outfit bg-slate-50">
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-20">
        <h1 className="text-4xl md:text-5xl font-semibold text-slate-900">
          Destinations
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600 leading-relaxed">
          Pick a city, read the guide, then copy its day-by-day itinerary into
          your own trip. Change the dates, swap anything you like and invite the
          people you are travelling with.
        </p>
        <RegionGroups />
      </main>
      <SiteFooter />
    </div>
  );
}
