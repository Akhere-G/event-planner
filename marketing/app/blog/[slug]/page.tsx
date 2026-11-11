import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "../../components/SiteChrome";
import { PlaceSection } from "../components/PlaceSection";
import { TemplateLink } from "../components/TemplateLink";
import { blogPosts, getPost } from "../posts";
import { postPath, SITE_URL } from "../../lib/urls";
import type { BlogPost } from "../types";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    return {};
  }
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: postPath(post.slug) },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
    },
  };
}

function articleJsonLd(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    inLanguage: "en-GB",
    mainEntityOfPage: `${SITE_URL}${postPath(post.slug)}`,
    author: { "@type": "Organization", name: "TripTrack" },
    publisher: { "@type": "Organization", name: "TripTrack" },
    about: { "@type": "Place", name: `${post.city}, ${post.country}` },
  };
}

export default async function BlogPostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen font-outfit bg-slate-50">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd(post)).replace(/</g, "\\u003c"),
        }}
      />
      <main className="max-w-3xl mx-auto px-4 md:px-8 pt-28 pb-20">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-primary">
          {post.city}, {post.country}
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl font-semibold text-slate-900 leading-tight">
          {post.title}
        </h1>
        <div className="mt-6 space-y-4 text-lg text-slate-600 leading-relaxed">
          {post.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <aside className="mt-8 rounded-2xl border border-brand-primary/30 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {post.templateTitle}
          </h2>
          <p className="mt-1 text-slate-600">
            A free {post.templateDays}-day {post.city} itinerary with the
            restaurants, sights and places to stay from this guide. Copy it to
            your own dates and edit anything.
          </p>
          <TemplateLink
            post={post}
            label="See the template"
            className="mt-4 inline-block bg-brand-primary text-white font-semibold px-6 py-2.5 rounded-full hover:bg-brand-primary/90 transition-colors"
          />
        </aside>

        <section aria-labelledby="best-time" className="mt-14">
          <h2
            id="best-time"
            className="text-2xl md:text-3xl font-semibold text-slate-900"
          >
            Best time to visit {post.city}
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed">{post.bestTime}</p>
        </section>

        <PlaceSection
          id="restaurants"
          title={`Where to eat in ${post.city}`}
          places={post.restaurants}
        />
        <PlaceSection
          id="things-to-do"
          title={`Best things to do in ${post.city}`}
          places={post.thingsToDo}
        />
        <PlaceSection
          id="where-to-stay"
          title={`Where to stay in ${post.city}`}
          places={post.whereToStay}
        />
        <PlaceSection
          id="hidden-gems"
          title={`Hidden gems in ${post.city}`}
          places={post.hiddenGems}
        />

        <section className="mt-16 rounded-2xl bg-[#0F1419] p-8 text-center text-white">
          <h2 className="text-2xl font-semibold">
            Ready to plan your {post.city} trip?
          </h2>
          <p className="mt-2 text-white/70">
            Copy the {post.templateDays}-day template, pick your dates and share
            it with whoever is coming with you.
          </p>
          <TemplateLink
            post={post}
            label="See the template"
            className="mt-6 inline-block bg-brand-primary text-white font-semibold px-6 py-2.5 rounded-full hover:bg-brand-primary/90 transition-colors"
          />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
