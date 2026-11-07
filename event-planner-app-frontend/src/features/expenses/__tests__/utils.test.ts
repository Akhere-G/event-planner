import { describe, expect, it } from "vitest";
import type { Expense } from "../types";
import {
  budgetProgress,
  canChangeExpense,
  formatCurrency,
  spentByCategory,
  totalSpent,
} from "../utils";

const make = (category: Expense["category"], amountGbp: number): Expense => ({
  id: Math.random(),
  itineraryId: 1,
  description: "x",
  category,
  amount: amountGbp,
  currency: "GBP",
  amountGbp,
  spentOn: "2026-08-01",
  paidById: 1,
  splitType: "even_all",
  shares: [],
});

describe("expense utils", () => {
  const expenses = [
    make("food", 10.1),
    make("food", 20.2),
    make("transport", 5),
  ];

  it("totals without floating point drift", () => {
    expect(totalSpent(expenses)).toBe(35.3);
  });

  it("groups by category, largest first", () => {
    expect(spentByCategory(expenses)).toEqual([
      { category: "food", amount: 30.3 },
      { category: "transport", amount: 5 },
    ]);
  });

  it("reports budget progress", () => {
    expect(budgetProgress(50, 200)).toEqual({
      percent: 25,
      isOver: false,
      remaining: 150,
    });
  });

  it("caps the bar and flags overspending", () => {
    expect(budgetProgress(250, 200)).toEqual({
      percent: 100,
      isOver: true,
      remaining: -50,
    });
  });

  it("handles a missing budget", () => {
    expect(budgetProgress(10, null)).toEqual({
      percent: 0,
      isOver: false,
      remaining: null,
    });
  });
});

describe("formatCurrency", () => {
  it("defaults to pounds", () => {
    expect(formatCurrency(45)).toBe("£45.00");
  });

  it("formats an expense in its own currency", () => {
    expect(formatCurrency(820, "EUR")).toBe("€820.00");
  });
});

describe("canChangeExpense", () => {
  const expense = { ...make("food", 10), createdById: 5 };

  it("lets admins change anyone's expense", () => {
    expect(canChangeExpense("admin", 1, expense)).toBe(true);
  });

  it("lets editors change only their own", () => {
    expect(canChangeExpense("editor", 5, expense)).toBe(true);
    expect(canChangeExpense("editor", 6, expense)).toBe(false);
  });

  it("never lets viewers change one", () => {
    expect(canChangeExpense("viewer", 5, expense)).toBe(false);
  });
});
