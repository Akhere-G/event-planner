import type { BlogPlace } from "../types";

export function PlaceSection({
  id,
  title,
  places,
}: {
  id: string;
  title: string;
  places: BlogPlace[];
}) {
  return (
    <section aria-labelledby={id} className="mt-14">
      <h2 id={id} className="text-2xl md:text-3xl font-semibold text-slate-900">
        {title}
      </h2>
      <ul className="mt-6 space-y-6">
        {places.map((place) => (
          <li
            key={place.name}
            className="border-l-4 border-brand-primary/60 pl-5"
          >
            <h3 className="text-lg font-semibold text-slate-900">
              {place.name}
              <span className="ml-2 text-sm font-normal text-slate-500">
                {place.area}
              </span>
            </h3>
            <p className="mt-1 text-slate-600 leading-relaxed">
              {place.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
