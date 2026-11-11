import type { TemplateRegion } from "../constants";

interface RegionTogglesProps {
  regions: TemplateRegion[];
  selected: TemplateRegion[];
  counts: Partial<Record<TemplateRegion, number>>;
  onToggle: (region: TemplateRegion) => void;
}

export default function RegionToggles({
  regions,
  selected,
  counts,
  onToggle,
}: RegionTogglesProps) {
  return (
    <div role="group" aria-label="Regions" className="flex flex-wrap gap-2">
      {regions.map((region) => {
        const isSelected = selected.includes(region);
        return (
          <button
            key={region}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggle(region)}
            className={`px-4 py-2 rounded-full border-2 text-sm font-semibold ${
              isSelected
                ? "bg-brand-primary/10 border-brand-primary/50 text-text-primary"
                : "btn-secondary border-surface-border"
            }`}
          >
            {region}
            <span className="ml-2 text-text-secondary">
              {counts[region] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
