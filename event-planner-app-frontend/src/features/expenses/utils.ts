import type { Expense, ExpenseCategory } from "./types";

export const formatGbp = (amount: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);

export const roundMoney = (amount: number) => Math.round(amount * 100) / 100;

export const totalSpent = (expenses: Expense[]) =>
  roundMoney(expenses.reduce((sum, e) => sum + e.amountGbp, 0));

export const spentByCategory = (expenses: Expense[]) => {
  const totals = new Map<ExpenseCategory, number>();
  for (const expense of expenses) {
    totals.set(
      expense.category,
      roundMoney((totals.get(expense.category) ?? 0) + expense.amountGbp),
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
    remaining: roundMoney(budget - spent),
  };
};
