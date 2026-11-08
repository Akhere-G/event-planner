import { useState } from "react";
import { Plus } from "lucide-react";
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
        className="flex items-center gap-1 px-2 py-1 text-sm text-text-secondary hover:text-brand-primary"
      >
        <Plus size={16} aria-hidden />
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
