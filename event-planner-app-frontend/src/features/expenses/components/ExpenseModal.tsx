import { ConfirmModal } from "../../../components";
import type { Trip } from "../../trips/types";
import type { Expense, ExpensePrefill } from "../types";
import ExpenseForm from "./ExpenseForm";

export default function ExpenseModal({
  open,
  onOpenChange,
  trip,
  expense,
  prefill,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: Trip;
  expense?: Expense;
  prefill?: ExpensePrefill;
}) {
  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title={expense ? "Edit expense" : "Add expense"}
      hideButtons
    >
      <ExpenseForm
        trip={trip}
        expense={expense}
        prefill={prefill}
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
      />
    </ConfirmModal>
  );
}
