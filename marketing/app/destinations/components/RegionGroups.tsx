import { destinationGuides } from "../guides";
import { groupByRegion } from "../regions";
import { GuideCard } from "./GuideCard";

export function RegionGroups() {
  return (
    <>
      {groupByRegion(destinationGuides).map(({ region, guides }) => (
        <section key={region} className="mt-14">
          <h2 className="text-2xl font-semibold text-slate-900">{region}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
