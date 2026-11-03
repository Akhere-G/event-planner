import { useState } from "react";
import { Receipt } from "lucide-react";
import type { Trip } from "../../trips/types";
import { canUserEdit } from "../../users/utils";
import type { ExpensePrefill } from "../types";
import ExpenseModal from "./ExpenseModal";

export default function AddExpenseButton({
  trip,
  prefill,
}: {
  trip: Trip;
  prefill: ExpensePrefill;
}) {
  const [open, setOpen] = useState(false);

  if (!canUserEdit(trip.role)) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-text-secondary hover:text-brand-primary"
      >
        <Receipt size={14} />
        Add expense
      </button>
      {open && (
        <ExpenseModal
          open={open}
          onOpenChange={setOpen}
          trip={trip}
          prefill={prefill}
        />
      )}
    </>
  );
}
