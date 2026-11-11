import { Link } from "react-router";
import { CalendarDays, Copy, MapPin } from "lucide-react";
import type { TemplateSummary } from "../types";
import { durationLabel } from "../utils";
import TemplateCover from "./TemplateCover";

export default function TemplateCard({
  template,
}: {
  template: TemplateSummary;
}) {
  const {
    slug,
    title,
    destination,
    region,
    durationDays,
    description,
    coverImage,
    cloneCount,
  } = template;

  return (
    <article className="card relative p-0 overflow-hidden flex flex-col">
      <TemplateCover
        src={coverImage}
        alt={`${destination} cover`}
        className="h-36 w-full"
      />
      <div className="p-4 flex flex-col gap-3 grow">
        <div>
          <h3 className="text-lg font-bold">
            <Link
              to={`/templates/${slug}`}
              className="text-text-primary after:absolute after:inset-0"
            >
              {title}
            </Link>
          </h3>
          <p className="text-text-secondary flex items-center gap-1">
            <MapPin size={16} aria-hidden /> {destination}
          </p>
        </div>
        {description && (
          <p className="text-text-secondary line-clamp-3">{description}</p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
          <span className="expense-chip">{region}</span>
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
