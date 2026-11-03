import { useState } from "react";
import { EstimateCostsButton } from "../../ai/components";
import { useGetAccommodationsQuery } from "../../accommodations/accomodationApiSlice";
import type { Trip } from "../../trips/types";
import { canUserEdit } from "../../users/utils";
import { buildPlannedBudget, plannedItemPrefill } from "../planned";
import type { Expense, ExpensePrefill } from "../types";
import { formatGbp, totalSpent } from "../utils";
import ExpenseModal from "./ExpenseModal";
import PlannedItemRow from "./PlannedItemRow";

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-text-secondary">{label}</span>
      <span className="text-lg font-semibold text-text-primary">{value}</span>
    </div>
  );
}

export default function PlannedBudgetPanel({
  trip,
  expenses,
}: {
  trip: Trip;
  expenses: Expense[];
}) {
  const { data } = useGetAccommodationsQuery(trip.id);
  const [prefill, setPrefill] = useState<ExpensePrefill | null>(null);

  const { items, plannedTotal, unestimatedCount } = buildPlannedBudget(
    trip.events,
    data?.data ?? [],
    { headcount: trip.userMemberships.length, expenses },
  );
  const canEdit = canUserEdit(trip.role);

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            Planned vs actual
          </h3>
          <p className="text-sm text-text-secondary">
            Estimates are per person and scaled to {trip.userMemberships.length}{" "}
            {trip.userMemberships.length === 1 ? "member" : "members"}.
          </p>
        </div>
        {unestimatedCount > 0 && <EstimateCostsButton trip={trip} />}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Figure label="Planned (estimated)" value={formatGbp(plannedTotal)} />
        <Figure label="Actual" value={formatGbp(totalSpent(expenses))} />
        <Figure
          label="Budget"
          value={
            trip.budgetAmountGbp ? formatGbp(trip.budgetAmountGbp) : "Not set"
          }
        />
      </div>

      {items.length > 0 ? (
        <ul className="flex flex-col divide-y divide-surface-border border-t border-surface-border">
          {items.map((item) => (
            <PlannedItemRow
              key={item.key}
              item={item}
              onLog={
                canEdit && item.actual === 0
                  ? () => setPrefill(plannedItemPrefill(item))
                  : undefined
              }
            />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-text-secondary">
          No cost estimates yet. Use Estimate costs to see what the trip should
          cost.
        </p>
      )}

      {prefill && (
        <ExpenseModal
          open
          onOpenChange={(open) => !open && setPrefill(null)}
          trip={trip}
          prefill={prefill}
        />
      )}
    </div>
  );
}
