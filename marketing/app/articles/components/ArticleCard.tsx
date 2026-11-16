import Image from "next/image";
import Link from "next/link";
import { articlePath } from "../../lib/urls";
import type { TravelArticle } from "../types";

export function ArticleCard({ article }: { article: TravelArticle }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-surface-border bg-surface">
      <Link href={articlePath(article.slug)}>
        <Image
          src={article.image.src}
          alt={article.image.alt}
          width={article.image.width}
          height={article.image.height}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="aspect-[16/9] w-full object-cover"
        />
        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
            {article.categoryLabel}
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-snug text-text-primary">
            {article.title}
          </h2>
          <p className="mt-3 leading-6 text-text-secondary">{article.excerpt}</p>
          <p className="mt-4 text-sm text-text-secondary">
            {article.readingMinutes} minute read
          </p>
        </div>
      </Link>
    </article>
  );
}
