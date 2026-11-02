import { format } from "date-fns";
import type { TripFormValues } from "../schemas/tripFormSchemas";
import {
  BUDGET_TIER_LABELS,
  PACE_LABELS,
  TRIP_TYPE_LABELS,
  VIBE_OPTIONS,
} from "../constants";

const vibeLabel = (value: string) =>
  VIBE_OPTIONS.find((option) => option.value === value)?.label ?? value;

export default function TripReview({ values }: { values: TripFormValues }) {
  const rows: [string, string][] = [
    ["Destination", values.destination],
    ["Name", values.name],
    [
      "Dates",
      `${format(new Date(values.startDate), "d MMM yyyy")} – ${format(new Date(values.endDate), "d MMM yyyy")}`,
    ],
    [
      "Travellers",
      [
        values.tripType && TRIP_TYPE_LABELS[values.tripType],
        values.groupSize &&
          `${values.groupSize} ${values.groupSize === 1 ? "person" : "people"}`,
      ]
        .filter(Boolean)
        .join(", "),
    ],
    ["Vibe", values.vibes.map(vibeLabel).join(", ")],
    ["Pace", values.pace ? PACE_LABELS[values.pace] : ""],
    [
      "Budget tier",
      values.budgetTier ? BUDGET_TIER_LABELS[values.budgetTier] : "",
    ],
    [
      "Total budget",
      values.budgetAmountGbp != null ? `£${values.budgetAmountGbp}` : "",
    ],
  ];

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
      {rows
        .filter(([, value]) => value)
        .map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-text-secondary">{label}</dt>
            <dd className="text-text-primary">{value}</dd>
          </div>
        ))}
    </dl>
  );
}
