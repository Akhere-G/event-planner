import { useState } from "react";
import { Plus } from "lucide-react";
import { StateGate } from "../../../components";
import type { Trip } from "../../trips/types";
import { canUserEdit } from "../../users/utils";
import { useGetExpensesQuery } from "../services/expenseApiSlice";
import BalancesPanel from "./BalancesPanel";
import BudgetSummary from "./BudgetSummary";
import ExpenseList from "./ExpenseList";
import ExpenseModal from "./ExpenseModal";

export default function BudgetPage({ trip }: { trip: Trip }) {
  const { data, isLoading, isError } = useGetExpensesQuery(trip.id);
  const [isAdding, setIsAdding] = useState(false);
  const expenses = data?.data ?? [];

  return (
    <StateGate loadingStateProps={{ isLoading }} errorStateProps={{ isError }}>
      <div className="flex flex-col gap-6">
        <BudgetSummary trip={trip} expenses={expenses} />
        <div className="grid grid-cols-1 gap-6">
          <div className="card lg:col-span-2 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-text-primary">
                Expenses
              </h3>
              {canUserEdit(trip.role) && (
                <button
                  type="button"
                  className="btn-primary flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm"
                  onClick={() => setIsAdding(true)}
                >
                  <Plus size={16} />
                  Add expense
                </button>
              )}
            </div>
            <StateGate
              emptyStateProps={{
                isEmpty: expenses.length === 0,
                message:
                  "No expenses yet. Add the first one to start tracking.",
              }}
            >
              <ExpenseList trip={trip} expenses={expenses} />
            </StateGate>
          </div>
          <BalancesPanel trip={trip} />
        </div>
        {isAdding && (
          <ExpenseModal open onOpenChange={setIsAdding} trip={trip} />
        )}
      </div>
    </StateGate>
  );
}
