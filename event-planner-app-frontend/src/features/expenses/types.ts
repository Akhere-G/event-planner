export const expenseCategories = [
  "lodging",
  "food",
  "activities",
  "transport",
  "shopping",
  "other",
] as const;
export type ExpenseCategory = (typeof expenseCategories)[number];

export const splitTypes = ["even_all", "selected", "self"] as const;
export type SplitType = (typeof splitTypes)[number];

export interface ExpenseShare {
  userId: number;
  amountGbp: number;
}

export interface Expense {
  id: number;
  itineraryId: number;
  description: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  amountGbp: number;
  spentOn: string;
  paidById: number;
  paidBy?: { id: number; username: string };
  eventId?: number | null;
  accommodationId?: number | null;
  splitType: SplitType;
  shares: ExpenseShare[];
  createdById?: number | null;
}

export interface Settlement {
  id: number;
  itineraryId: number;
  fromUserId: number;
  toUserId: number;
  amountGbp: number;
  settledOn: string;
  fromUser?: { id: number; username: string };
  toUser?: { id: number; username: string };
}

export interface Balance {
  userId: number;
  username: string;
  netGbp: number;
}

export interface Transfer {
  fromUserId: number;
  toUserId: number;
  amountGbp: number;
}

export interface Balances {
  balances: Balance[];
  transfers: Transfer[];
  totalSpentGbp: number;
}

export interface ExpensePrefill {
  description?: string;
  amount?: number;
  eventId?: number;
  accommodationId?: number;
  category?: ExpenseCategory;
  spentOn?: string;
}
