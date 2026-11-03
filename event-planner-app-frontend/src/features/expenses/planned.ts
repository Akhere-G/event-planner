import type { Accommodation } from "../accommodations/types";
import type { Event } from "../events/types";
import type { Expense, ExpenseCategory, ExpensePrefill } from "./types";
import { roundMoney, totalSpent } from "./utils";

export interface PlannedItem {
  key: string;
  name: string;
  spentOn: string;
  category: ExpenseCategory;
  link: Pick<ExpensePrefill, "eventId" | "accommodationId">;
  planned: number;
  actual: number;
}

export interface PlannedBudget {
  items: PlannedItem[];
  plannedTotal: number;
  unestimatedCount: number;
}

interface PlanningContext {
  headcount: number;
  expenses: Expense[];
}

// Estimates are per person, so the planned cost for the group is scaled by headcount.
const plannedCost = (perPerson: number, { headcount }: PlanningContext) =>
  roundMoney(perPerson * headcount);

const eventItem = (event: Event, context: PlanningContext): PlannedItem => ({
  key: `event-${event.id}`,
  name: event.name,
  spentOn: event.startAt.slice(0, 10),
  category: "activities",
  link: { eventId: event.id },
  planned: plannedCost(event.estimatedCostGbp ?? 0, context),
  actual: totalSpent(context.expenses.filter((e) => e.eventId === event.id)),
});

const accommodationItem = (
  accommodation: Accommodation,
  context: PlanningContext,
): PlannedItem => ({
  key: `accommodation-${accommodation.id}`,
  name: accommodation.name,
  spentOn: accommodation.startDate,
  category: "lodging",
  link: { accommodationId: accommodation.id },
  planned: plannedCost(accommodation.estimatedCostGbp ?? 0, context),
  actual: totalSpent(
    context.expenses.filter((e) => e.accommodationId === accommodation.id),
  ),
});

const hasEstimate = (item: { estimatedCostGbp?: number | null }) =>
  item.estimatedCostGbp != null;

export const buildPlannedBudget = (
  events: Event[],
  accommodations: Accommodation[],
  context: PlanningContext,
): PlannedBudget => {
  const items = [
    ...accommodations
      .filter(hasEstimate)
      .map((accommodation) => accommodationItem(accommodation, context)),
    ...events.filter(hasEstimate).map((event) => eventItem(event, context)),
  ];
  return {
    items,
    plannedTotal: roundMoney(items.reduce((sum, i) => sum + i.planned, 0)),
    unestimatedCount: [...events, ...accommodations].filter(
      (item) => !hasEstimate(item),
    ).length,
  };
};

export const plannedItemPrefill = (item: PlannedItem): ExpensePrefill => ({
  ...item.link,
  description: item.name,
  amount: item.planned,
  category: item.category,
  spentOn: item.spentOn,
});
