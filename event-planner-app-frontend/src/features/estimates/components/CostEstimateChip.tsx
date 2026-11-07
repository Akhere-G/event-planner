import type { CostEstimate } from "../utils";

export default function CostEstimateChip({
  estimate,
}: {
  estimate?: CostEstimate;
}) {
  if (!estimate) return null;

  return (
    <>
      {estimate.cost && (
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary"
          title="Estimated cost per person"
        >
          {estimate.cost}
        </span>
      )}
      {estimate.tier && (
        <span
          className="text-xs text-text-secondary"
          aria-label={`Price tier ${estimate.tier.length} of 4`}
        >
          {estimate.tier}
        </span>
      )}
    </>
  );
}
