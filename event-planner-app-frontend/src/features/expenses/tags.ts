import type { ApiTag } from "../realtime/entityTags";

/**
 * Everything a change to an expense can make stale: the expense list and
 * balances, and the events, stays and flights that embed their own expense.
 * Local mutations and the realtime mapping share this so they cannot drift.
 */
export const expenseDependentTags = (tripId: number): ApiTag[] => [
  { type: "Expenses", id: tripId },
  { type: "Events", id: tripId },
  { type: "Flights", id: tripId },
  "Accommodations",
];
