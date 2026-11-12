import Link from "next/link";
import { guidePath } from "../../lib/urls";
import type { DestinationGuide } from "../types";
import { TemplateLink } from "./TemplateLink";

export function GuideCard({ guide }: { guide: DestinationGuide }) {
  return (
    <article className="flex flex-col bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
        {guide.country}
      </p>
      <h3 className="mt-2 text-xl font-semibold text-slate-900">
        <Link href={guidePath(guide.slug)}>{guide.city}</Link>
      </h3>
      <p className="mt-2 text-sm text-slate-600 leading-relaxed flex-1">
        {guide.description}
      </p>
      <div className="mt-5 flex items-center justify-between gap-3 text-sm font-semibold">
        <Link
          href={guidePath(guide.slug)}
          className="text-slate-900 hover:text-brand-primary transition-colors"
        >
          Read the guide
        </Link>
        <TemplateLink
          guide={guide}
          label={`${guide.templateDays}-day template`}
          className="text-brand-primary hover:text-brand-primary/80 transition-colors"
        />
      </div>
    </article>
  );
}
