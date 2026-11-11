import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../test-utils/renderWithProviders";
import type { Trip } from "../../trips/types";
import ExpenseList from "../components/ExpenseList";
import type { Expense } from "../types";

const trip = { id: 1, role: "viewer" } as unknown as Trip;

const expense = (overrides: Partial<Expense>): Expense => ({
  id: 1,
  itineraryId: 1,
  description: "Dinner",
  category: "food",
  amount: 40,
  currency: "GBP",
  amountGbp: 40,
  fxRate: 1,
  spentOn: "2026-08-01",
  paidById: 5,
  splitType: "even_all",
  shares: [],
  createdById: 5,
  ...overrides,
});

function renderList(expenses: Expense[]) {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockImplementation(
        async () =>
          new Response(
            JSON.stringify({ success: true, data: { events: [] } }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          ),
      ),
  );
  renderWithProviders(<ExpenseList trip={trip} expenses={expenses} />);
}

afterEach(() => vi.unstubAllGlobals());

describe("ExpenseList", () => {
  it("shows a pound expense once", () => {
    renderList([expense({})]);

    const row = screen.getByRole("listitem");
    expect(within(row).getAllByText("£40.00")).toHaveLength(1);
  });

  it("shows a foreign expense as paid, with its value in pounds beneath", () => {
    renderList([
      expense({
        description: "Taxi",
        amount: 50,
        currency: "EUR",
        amountGbp: 42.5,
        fxRate: 0.85,
      }),
    ]);

    const row = screen.getByRole("listitem");
    expect(within(row).getByText("€50.00")).toBeInTheDocument();
    expect(within(row).getByText("£42.50")).toBeInTheDocument();
  });
});
