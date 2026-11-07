import { canUserEdit, isAdmin } from "../users/utils";
import type { Expense, ExpenseCategory } from "./types";

export const formatCurrency = (amount: number, currency = "GBP") =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(amount);

export const formatGbp = (amount: number) => formatCurrency(amount);

/** Admins can change any expense; editors only the ones they added. */
export const canChangeExpense = (
  role: string,
  userId: number | null | undefined,
  expense: Expense,
) => canUserEdit(role) && (isAdmin(role) || expense.createdById === userId);

export const totalSpent = (expenses: Expense[]) =>
  Math.round(expenses.reduce((sum, e) => sum + e.amountGbp, 0) * 100) / 100;

export const spentByCategory = (expenses: Expense[]) => {
  const totals = new Map<ExpenseCategory, number>();
  for (const expense of expenses) {
    totals.set(
      expense.category,
      Math.round(
        ((totals.get(expense.category) ?? 0) + expense.amountGbp) * 100,
      ) / 100,
    );
  }
  return [...totals.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
};

export const budgetProgress = (
  spent: number,
  budget: number | null | undefined,
) => {
  if (!budget || budget <= 0)
    return { percent: 0, isOver: false, remaining: null };
  return {
    percent: Math.min(100, Math.round((spent / budget) * 100)),
    isOver: spent > budget,
    remaining: Math.round((budget - spent) * 100) / 100,
  };
};
