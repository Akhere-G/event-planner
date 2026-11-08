import { canUserEdit, isAdmin } from "../users/utils";
import type { Expense, ExpenseCategory, Settlement } from "./types";

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

/** Same rule as expenses: admins change any payment, editors the ones they recorded. */
export const canChangeSettlement = (
  role: string,
  userId: number | null | undefined,
  settlement: Settlement,
) => canUserEdit(role) && (isAdmin(role) || settlement.createdById === userId);

interface Person {
  id: number;
  username: string;
}

/**
 * Who a payment or an expense can be paid by. Admins pick anyone; everyone else
 * only themselves, plus whoever it is already recorded against so that editing
 * it does not silently change the payer.
 */
export const payerOptions = <T extends Person>(
  members: T[],
  role: string,
  userId: number | null | undefined,
  currentId?: number | null,
) =>
  isAdmin(role)
    ? members
    : members.filter((m) => m.id === userId || m.id === currentId);

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
