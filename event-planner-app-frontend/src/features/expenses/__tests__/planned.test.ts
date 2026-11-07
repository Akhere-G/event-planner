import { describe, expect, it } from "vitest";
import type { Accommodation } from "../../accommodations/types";
import type { Event } from "../../events/types";
import { buildPlannedBudget, plannedItemPrefill } from "../planned";
import type { Expense } from "../types";

const event = (id: number, estimatedCostGbp?: number): Event => ({
  id,
  name: `Event ${id}`,
  address: "",
  latitude: 0,
  longitude: 0,
  startAt: "2026-08-02 10:00",
  endAt: "2026-08-02 12:00",
  category: "general",
  estimatedCostGbp,
});

const hotel: Accommodation = {
  id: 7,
  itineraryId: 1,
  name: "Hotel",
  address: "",
  latitude: 0,
  longitude: 0,
  startDate: "2026-08-01",
  endDate: "2026-08-04",
  estimatedCostGbp: 150,
};

const expense = (overrides: Partial<Expense>): Expense => ({
  id: 1,
  itineraryId: 1,
  description: "x",
  category: "other",
  amount: 0,
  currency: "GBP",
  amountGbp: 0,
  spentOn: "2026-08-01",
  paidById: 1,
  splitType: "even_all",
  shares: [],
  ...overrides,
});

describe("buildPlannedBudget", () => {
  const expenses = [
    expense({ id: 1, eventId: 1, amountGbp: 30 }),
    expense({ id: 2, eventId: 1, amountGbp: 10.5 }),
    expense({ id: 3, accommodationId: 7, amountGbp: 400 }),
  ];
  const budget = buildPlannedBudget(
    [event(1, 20), event(2, 12.5), event(3)],
    [hotel],
    { headcount: 3, expenses },
  );

  it("scales per-person estimates by the group size and totals them", () => {
    expect(budget.items.map((i) => [i.name, i.planned])).toEqual([
      ["Hotel", 450],
      ["Event 1", 60],
      ["Event 2", 37.5],
    ]);
    expect(budget.plannedTotal).toBe(547.5);
  });

  it("sums actual spend linked to each item and counts items without estimates", () => {
    expect(budget.items.map((i) => i.actual)).toEqual([400, 40.5, 0]);
    expect(budget.unestimatedCount).toBe(1);
  });

  it("prefills the expense form from the estimate", () => {
    expect(plannedItemPrefill(budget.items[0])).toEqual({
      accommodationId: 7,
      description: "Hotel",
      amount: 450,
      category: "lodging",
      spentOn: "2026-08-01",
    });
  });
});
