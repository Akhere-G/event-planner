import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { TrackedLink } from "../../components/TrackedLink";
import { APP_URL, articlePath, guidePath, templateUrl } from "../../lib/urls";
import { getGuide } from "../../destinations/guides";
import type { ArticleSource } from "../types";

export function GuideLink({ slug, children }: { slug: string; children: ReactNode }) {
  return (
    <Link className="font-medium text-brand-primary underline" href={guidePath(slug)}>
      {children}
    </Link>
  );
}

export function ArticleLink({ slug, children }: { slug: string; children: ReactNode }) {
  return (
    <Link className="font-medium text-brand-primary underline" href={articlePath(slug)}>
      {children}
    </Link>
  );
}

export function ItineraryLink({ slug, children }: { slug: string; children: ReactNode }) {
  return (
    <TrackedLink
      className="font-medium text-brand-primary underline"
      event="article_template_link_clicked"
      href={templateUrl(slug)}
    >
      {children}
    </TrackedLink>
  );
}

export function AppLink({ children }: { children: ReactNode }) {
  return (
    <TrackedLink
      className="font-medium text-brand-primary underline"
      event="article_app_link_clicked"
      href={APP_URL}
    >
      {children}
    </TrackedLink>
  );
}

export function ArticleSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mt-12">
      <h2 id={id} className="text-2xl font-semibold text-text-primary md:text-3xl">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-base leading-7 text-text-secondary md:text-lg">
        {children}
      </div>
    </section>
  );
}

export function Subheading({ children }: { children: ReactNode }) {
  return <h3 className="pt-3 text-xl font-semibold text-text-primary">{children}</h3>;
}

export function CheckList({ children }: { children: ReactNode }) {
  return <ul className="space-y-2 pl-6 marker:text-brand-primary list-disc">{children}</ul>;
}

export function DecisionBox({ children }: { children: ReactNode }) {
  return (
    <aside className="mt-8 rounded-2xl border border-brand-primary/30 bg-surface p-6 text-text-secondary">
      <h2 className="text-xl font-semibold text-text-primary">The short answer</h2>
      <div className="mt-3 space-y-3 leading-7">{children}</div>
    </aside>
  );
}

export function ComparisonTable({
  firstLabel,
  secondLabel,
  rows,
}: {
  firstLabel: string;
  secondLabel: string;
  rows: { criterion: string; first: string; second: string }[];
}) {
  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-surface-border bg-surface">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead className="bg-surface-muted text-text-primary">
          <tr>
            <th className="p-4 font-semibold">Criterion</th>
            <th className="p-4 font-semibold">{firstLabel}</th>
            <th className="p-4 font-semibold">{secondLabel}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border text-text-secondary">
          {rows.map((row) => (
            <tr key={row.criterion}>
              <th className="p-4 font-semibold text-text-primary">{row.criterion}</th>
              <td className="p-4">{row.first}</td>
              <td className="p-4">{row.second}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProductScreenshot({
  src,
  alt,
  width,
  height,
  caption,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
}) {
  return (
    <figure className="my-10">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        sizes="(min-width: 768px) 704px, calc(100vw - 32px)"
        className="h-auto w-full rounded-2xl border border-surface-border"
      />
      <figcaption className="mt-3 text-sm leading-6 text-text-secondary">
        {caption}
      </figcaption>
    </figure>
  );
}

export function TripTrackCta({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <aside className="mt-12 rounded-2xl bg-text-primary p-7 text-text-inverse">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-3 max-w-2xl leading-7 text-text-inverse/75">{children}</p>
      <TrackedLink
        href={APP_URL}
        event="article_cta_clicked"
        className="mt-5 inline-block rounded-full bg-brand-primary px-6 py-2.5 font-semibold text-text-inverse transition-colors hover:bg-brand-primary/90"
      >
        Plan a trip with TripTrack
      </TrackedLink>
    </aside>
  );
}

export function GuideAndTemplateLinks({ slugs }: { slugs: string[] }) {
  return (
    <aside className="mt-12 rounded-2xl border border-surface-border bg-surface p-6">
      <h2 className="text-xl font-semibold text-text-primary">Plan the trips mentioned here</h2>
      <ul className="mt-4 space-y-3">
        {slugs.map((slug) => {
          const guide = getGuide(slug);
          if (!guide) {
            return null;
          }
          return (
            <li key={slug} className="text-text-secondary">
              <GuideLink slug={slug}>{guide.city} guide</GuideLink>
              {" · "}
              <ItineraryLink slug={guide.templateSlug}>
                {guide.templateDays}-day itinerary template
              </ItineraryLink>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

export function Sources({ sources }: { sources: ArticleSource[] }) {
  return (
    <section aria-labelledby="sources" className="mt-12 border-t border-surface-border pt-8">
      <h2 id="sources" className="text-xl font-semibold text-text-primary">
        Sources and practical checks
      </h2>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        Features, prices, opening arrangements and visitor rules can change. Check the
        relevant official pages again before relying on them.
      </p>
      <ul className="mt-4 space-y-2 text-sm text-text-secondary">
        {sources.map((source) => (
          <li key={source.url}>
            <a className="text-brand-primary underline" href={source.url} rel="noopener">
              {source.title}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
