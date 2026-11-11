import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { RegionGroups } from "./components/RegionGroups";

export const metadata: Metadata = {
  title: "Travel guides: where to eat, stay and explore",
  description:
    "City travel guides covering the best restaurants, things to do, places to stay and hidden gems, each with a ready-made trip template you can copy and edit.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen font-outfit bg-slate-50">
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-20">
        <h1 className="text-4xl md:text-5xl font-semibold text-slate-900">
          Travel guides
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600 leading-relaxed">
          Where to eat, what to see, where to stay and the places most visitors
          miss. Every guide comes with a trip template you can copy to your own
          dates and make yours.
        </p>
        <RegionGroups />
      </main>
      <SiteFooter />
    </div>
  );
}
