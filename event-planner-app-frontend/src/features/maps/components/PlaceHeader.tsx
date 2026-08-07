import { Star, Tag as TagIcon } from "lucide-react";

export function PlaceHeader({
  name,
  rating,
  totalReviews,
  category,
}: {
  name: string;
  rating: number;
  totalReviews: number;
  category: string;
}) {
  return (
    <header className="truncate font-bold tracking-tight text-text-primary flex flex-col lg:flex-row gap-2 w-full lg:items-center lg:justify-between">
      <h3 className="text-sm lg:text-md truncate p-0! m-0!">{name}</h3>
      <div className="text-xs lg:text-sm flex justify-between items-center gap-2">
        <span className="text-warning flex gap-1 items-center">
          <Star fill="var(--color-warning)" size={14} />
          {rating}
          <span className="text-text-secondary">({totalReviews})</span>
        </span>
        <span className="text-xs flex items-center gap-1 px-2 py-1 rounded-full bg-brand-secondary/10 text-brand-secondary font-semibold uppercase">
          <TagIcon size={16} />
          {category}
        </span>
      </div>
    </header>
  );
}
