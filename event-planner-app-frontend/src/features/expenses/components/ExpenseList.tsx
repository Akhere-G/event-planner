import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useSelector } from "react-redux";
import { ConfirmModal } from "../../../components";
import type { RootState } from "../../../store";
import { BASE_CURRENCY } from "../../currency/constants";
import useTripEvents from "../../events/hooks/useTripEvents";
import type { Trip } from "../../trips/types";
import useDeleteExpense from "../hooks/useDeleteExpense";
import type { Expense } from "../types";
import { canChangeExpense, formatCurrency, formatGbp } from "../utils";
import ExpenseModal from "./ExpenseModal";

export default function ExpenseList({
  trip,
  expenses,
}: {
  trip: Trip;
  expenses: Expense[];
}) {
  const userId = useSelector((state: RootState) => state.auth.userId);
  const { events } = useTripEvents(trip.id);
  const { remove } = useDeleteExpense(trip.id);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);

  const canChange = (expense: Expense) =>
    canChangeExpense(trip.role, userId, expense);

  const linkedName = (expense: Expense) =>
    events.find((e) => e.id === expense.eventId)?.name;

  const handleDelete = async () => {
    if (!deleting) return;
    if (await remove(deleting.id)) setDeleting(null);
  };

  return (
    <>
      <ul className="flex flex-col divide-y divide-surface-border">
        {expenses.map((expense) => (
          <li
            key={expense.id}
            className="flex items-center justify-between gap-3 py-3"
          >
            <div className="min-w-0">
              <p className="font-medium text-text-primary truncate">
                {expense.description}
              </p>
              <p className="text-xs text-text-secondary">
                {format(parseISO(expense.spentOn), "d MMM yyyy")} ·{" "}
                <span className="capitalize">{expense.category}</span> · paid by{" "}
                {expense.paidBy?.username ?? "someone"}
                {linkedName(expense) ? ` · ${linkedName(expense)}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right">
                <span className="font-semibold text-text-primary">
                  {formatCurrency(expense.amount, expense.currency)}
                </span>
                {expense.currency !== BASE_CURRENCY && (
                  <p className="text-xs text-text-secondary">
                    {formatGbp(expense.amountGbp)}
                  </p>
                )}
              </div>
              {canChange(expense) && (
                <>
                  <button
                    type="button"
                    aria-label={`Edit ${expense.description}`}
                    className="p-1 rounded hover:bg-surface-muted text-text-secondary"
                    onClick={() => setEditing(expense)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${expense.description}`}
                    className="p-1 rounded hover:bg-surface-muted text-error"
                    onClick={() => setDeleting(expense)}
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
      {editing && (
        <ExpenseModal
          open
          onOpenChange={(open) => !open && setEditing(null)}
          trip={trip}
          expense={editing}
        />
      )}
      {deleting && (
        <ConfirmModal
          open
          onOpenChange={(open) => !open && setDeleting(null)}
          title={`Delete '${deleting.description}'`}
          confirmAction={handleDelete}
        />
      )}
    </>
  );
}
