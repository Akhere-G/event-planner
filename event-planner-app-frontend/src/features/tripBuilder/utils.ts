import { convertUtcToTripTimezone } from "../../utils/dateFormattors";
import type { ChangeEntity, ChangeOp } from "../ai/types";

export interface DraftDay {
  date: string;
  eventNames: string[];
}

export interface DraftSummary {
  days: DraftDay[];
  accommodations: string[];
  packingItems: string[];
  wishlistItems: string[];
}

const names = (ops: ChangeOp[], entity: ChangeEntity) =>
  ops
    .filter((op) => op.entity === entity)
    .map((op) => String(op.data.name ?? ""))
    .filter(Boolean);

function groupEventsByDay(ops: ChangeOp[], timezone: string): DraftDay[] {
  const byDate = new Map<string, string[]>();
  ops
    .filter(
      (op) => op.entity === "event" && typeof op.data.startAt === "string",
    )
    .forEach((op) => {
      const date = convertUtcToTripTimezone(
        op.data.startAt as string,
        timezone,
      ).slice(0, 10);
      byDate.set(date, [...(byDate.get(date) ?? []), String(op.data.name)]);
    });
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, eventNames]) => ({ date, eventNames }));
}

export function summariseDraft(
  ops: ChangeOp[],
  timezone: string,
): DraftSummary {
  return {
    days: groupEventsByDay(ops, timezone),
    accommodations: names(ops, "accommodation"),
    packingItems: names(ops, "packing_item"),
    wishlistItems: names(ops, "wishlist_item"),
  };
}

export const STARTER_PROMPTS = [
  "A relaxed week in Lisbon for two, mostly food and sights",
  "A long weekend in Edinburgh with friends",
  "Family trip to Rome next summer",
  "Budget backpacking through Vietnam for 10 days",
];
