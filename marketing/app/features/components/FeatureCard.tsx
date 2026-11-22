import Image from "next/image";
import Link from "next/link";
import { featurePath } from "../index";
import type { FeaturePage } from "../types";

export function FeatureCard({ feature }: { feature: FeaturePage }) {
  const [screenshot] = feature.screenshots;
  return (
    <article className="overflow-hidden rounded-2xl border border-surface-border bg-surface transition-colors hover:border-brand-primary">
      <Link href={featurePath(feature.slug)}>
        <Image
          src={screenshot.src}
          alt={screenshot.alt}
          width={screenshot.width}
          height={screenshot.height}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="aspect-[16/10] w-full border-b border-surface-border object-cover object-left-top"
        />
        <div className="p-6">
          <h2 className="text-xl font-semibold leading-snug text-text-primary">
            {feature.name}
          </h2>
          <p className="mt-3 leading-6 text-text-secondary">{feature.description}</p>
        </div>
      </Link>
    </article>
  );
}
