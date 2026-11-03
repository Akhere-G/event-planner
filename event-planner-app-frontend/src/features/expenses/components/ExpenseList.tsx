import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { ConfirmModal } from "../../../components";
import type { RootState } from "../../../store";
import { isApiError } from "../../api/utils";
import type { Trip } from "../../trips/types";
import { canUserEdit, isAdmin } from "../../users/utils";
import { useDeleteExpenseMutation } from "../services/expenseApiSlice";
import type { Expense } from "../types";
import useMoney from "../../currency/useMoney";
import ExpenseModal from "./ExpenseModal";

export default function ExpenseList({
  trip,
  expenses,
}: {
  trip: Trip;
  expenses: Expense[];
}) {
  const money = useMoney();
  const userId = useSelector((state: RootState) => state.auth.userId);
  const [deleteExpense] = useDeleteExpenseMutation();
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);

  const canChange = (expense: Expense) =>
    canUserEdit(trip.role) &&
    (isAdmin(trip.role) || expense.createdById === userId);

  const linkedName = (expense: Expense) =>
    trip.events.find((e) => e.id === expense.eventId)?.name;

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteExpense({ tripId: trip.id, expenseId: deleting.id }).unwrap();
      toast.success("Expense deleted.");
      setDeleting(null);
    } catch (err) {
      toast.error(
        isApiError(err) ? err.data.message : "Could not delete the expense.",
      );
    }
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
                  {expense.currency === "GBP"
                    ? money.format(expense.amountGbp)
                    : money.formatOriginal(expense.amount, expense.currency)}
                </span>
                {expense.currency !== "GBP" && (
                  <p className="text-xs text-text-secondary">
                    {money.format(expense.amountGbp)}
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
