import { useState } from "react";
import { Receipt } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import type { Trip } from "../../trips/types";
import type { Expense, ExpensePrefill } from "../types";
import { canChangeExpense, formatCurrency } from "../utils";
import AddExpenseButton from "./AddExpenseButton";
import ExpenseModal from "./ExpenseModal";

/**
 * What an itinerary item shows for its expense: a chip with the amount that
 * opens the edit form, or the Add expense shortcut when it has none.
 */
export default function ExpenseChip({
  trip,
  expense,
  prefill,
}: {
  trip: Trip;
  expense?: Expense | null;
  prefill: ExpensePrefill;
}) {
  const userId = useSelector((state: RootState) => state.auth.userId);
  const [open, setOpen] = useState(false);

  if (!expense) return <AddExpenseButton trip={trip} prefill={prefill} />;

  const amount = (
    <>
      <Receipt size={16} aria-hidden />
      <span>{formatCurrency(expense.amount, expense.currency)}</span>
    </>
  );

  if (!canChangeExpense(trip.role, userId, expense)) {
    return (
      <span className="expense-chip" title={expense.description}>
        {amount}
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        className="expense-chip"
        title={expense.description}
        aria-label={`Edit expense: ${expense.description}`}
        onClick={() => setOpen(true)}
      >
        {amount}
        <span className="h-4 w-px bg-brand-primary/30" aria-hidden />
        <span className="text-xs uppercase">Edit</span>
      </button>
      {open && (
        <ExpenseModal
          open
          onOpenChange={setOpen}
          trip={trip}
          expense={expense}
        />
      )}
    </>
  );
}
