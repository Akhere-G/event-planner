const MAX_PRICE_TIER = 4;

export interface CostEstimate {
  cost?: string;
  tier?: string;
}

export const formatEstimatedCost = (cost: number) =>
  `~£${Number.isInteger(cost) ? cost : cost.toFixed(2)} pp`;

export const priceTierLabel = (tier: number) => "£".repeat(tier);

export const costEstimateLabels = (
  cost: unknown,
  tier: unknown,
): CostEstimate | undefined => {
  const result: CostEstimate = {};
  if (typeof cost === "number" && cost >= 0) {
    result.cost = formatEstimatedCost(cost);
  }
  if (typeof tier === "number" && tier >= 1 && tier <= MAX_PRICE_TIER) {
    result.tier = priceTierLabel(tier);
  }
  return result.cost || result.tier ? result : undefined;
};
