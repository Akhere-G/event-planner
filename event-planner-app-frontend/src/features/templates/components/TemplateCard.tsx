import { Link } from "react-router";
import { CalendarDays, Copy, MapPin } from "lucide-react";
import type { TemplateSummary } from "../types";
import { durationLabel } from "../utils";

export default function TemplateCard({
  template,
}: {
  template: TemplateSummary;
}) {
  const { slug, title, destination, durationDays, description, cloneCount } =
    template;

  return (
    <article className="relative md:rounded-md bg-surface shadow-md overflow-hidden flex flex-col">
      <div className="p-4 bg-linear-to-r from-brand-primary to-brand-secondary h-28">
        <h3 className="text-white text-lg font-bold">
          <Link to={`/templates/${slug}`} className="text-white">
            {title}
          </Link>
        </h3>
        <p className="text-white/90 flex items-center gap-1">
          <MapPin size={16} aria-hidden /> {destination}
        </p>
      </div>
      <div className="p-4 flex flex-col gap-3 grow">
        {description && (
          <p className="text-text-secondary line-clamp-3">{description}</p>
        )}
        <div className="mt-auto flex flex-wrap gap-4 text-sm text-text-secondary">
          <span className="flex items-center gap-1">
            <CalendarDays size={16} aria-hidden /> {durationLabel(durationDays)}
          </span>
          <span className="flex items-center gap-1">
            <Copy size={16} aria-hidden /> Used {cloneCount}{" "}
            {cloneCount === 1 ? "time" : "times"}
          </span>
        </div>
      </div>
    </article>
  );
}
