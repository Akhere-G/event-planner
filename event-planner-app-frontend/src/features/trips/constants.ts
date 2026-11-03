export const TRIP_TYPES = ["solo", "couple", "friends", "family"] as const;
export const BUDGET_TIERS = ["budget", "mid", "luxury"] as const;
export const PACES = ["relaxed", "balanced", "packed"] as const;
export const TRANSPORTS = [
  "walking",
  "public_transport",
  "driving",
  "cycling",
] as const;

export const TRIP_TYPE_LABELS: Record<(typeof TRIP_TYPES)[number], string> = {
  solo: "Solo",
  couple: "Couple",
  friends: "Friends",
  family: "Family",
};

export const BUDGET_TIER_LABELS: Record<(typeof BUDGET_TIERS)[number], string> =
  {
    budget: "Budget",
    mid: "Mid-range",
    luxury: "Luxury",
  };

export const PACE_LABELS: Record<(typeof PACES)[number], string> = {
  relaxed: "Relaxed",
  balanced: "Balanced",
  packed: "Packed",
};

export const TRANSPORT_LABELS: Record<(typeof TRANSPORTS)[number], string> = {
  walking: "Walking",
  public_transport: "Transit",
  driving: "Driving",
  cycling: "Cycling",
};

export const VIBE_OPTIONS = [
  { label: "Relaxing", value: "relaxing" },
  { label: "Adventure", value: "adventure" },
  { label: "Foodie", value: "foodie" },
  { label: "Culture", value: "culture" },
  { label: "Nightlife", value: "nightlife" },
  { label: "Nature", value: "nature" },
  { label: "Romantic", value: "romantic" },
  { label: "Shopping", value: "shopping" },
  { label: "Wellness", value: "wellness" },
  { label: "Hidden gems", value: "hidden_gems" },
] as const;

export const MAX_GROUP_SIZE = 100;
