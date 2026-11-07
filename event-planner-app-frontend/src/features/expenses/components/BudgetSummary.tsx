import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { FormInput } from "../../../components";
import { isApiError } from "../../api/utils";
import { useEditTripMutation } from "../../trips/services/tripsApiSlice";
import type { Trip } from "../../trips/types";
import { isAdmin } from "../../users/utils";
import { budgetSchema, type BudgetFormValues } from "../schema";
import useMoney from "../../currency/useMoney";
import type { Expense } from "../types";
import { budgetProgress, spentByCategory, totalSpent } from "../utils";

export default function BudgetSummary({
  trip,
  expenses,
}: {
  trip: Trip;
  expenses: Expense[];
}) {
  const money = useMoney();
  const [isEditing, setIsEditing] = useState(false);
  const [editTrip, { isLoading }] = useEditTripMutation();
  const { register, handleSubmit, formState } = useForm<BudgetFormValues>({
    resolver: yupResolver(budgetSchema),
    defaultValues: { budgetAmountGbp: trip.budgetAmountGbp ?? undefined },
  });

  const spent = totalSpent(expenses);
  const budget = trip.budgetAmountGbp;
  const progress = budgetProgress(spent, budget);
  const categories = spentByCategory(expenses);

  const onSubmit = async ({ budgetAmountGbp }: BudgetFormValues) => {
    try {
      await editTrip({
        tripId: trip.id,
        updatedTrip: { budgetAmountGbp },
      }).unwrap();
      toast.success("Budget updated.");
      setIsEditing(false);
    } catch (err) {
      toast.error(
        isApiError(err) ? err.data.message : "Could not update the budget.",
      );
    }
  };

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Budget</h3>
          <p className="text-sm text-text-secondary">
            {money.format(spent)} spent
            {budget ? ` of ${money.format(budget)}` : ""}
          </p>
        </div>
        {isAdmin(trip.role) && !isEditing && (
          <button
            type="button"
            className="btn-secondary flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm"
            onClick={() => setIsEditing(true)}
          >
            <Pencil size={14} />
            {budget ? "Edit budget" : "Set budget"}
          </button>
        )}
      </div>

      {isEditing && (
        <form
          className="flex items-end gap-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormInput
            label="Total budget (£)"
            type="number"
            step="0.01"
            min="0"
            formClassNames="flex-1"
            {...register("budgetAmountGbp")}
            errorMessage={formState.errors.budgetAmountGbp?.message}
          />
          <button
            type="submit"
            className="btn-primary h-11 px-4 rounded-xl"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            className="btn-secondary h-11 px-4 rounded-xl"
            onClick={() => setIsEditing(false)}
            disabled={isLoading}
          >
            Cancel
          </button>
        </form>
      )}

      {budget ? (
        <div className="flex flex-col gap-1">
          <div
            role="progressbar"
            aria-label="Budget used"
            aria-valuenow={progress.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            className="w-full bg-surface-muted rounded-full h-3 overflow-hidden border border-surface-border"
          >
            <div
              className={`${progress.isOver ? "bg-error" : "bg-brand-primary"} h-full rounded-full transition-all duration-500`}
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <p
            className={`text-xs ${progress.isOver ? "text-error" : "text-text-secondary"}`}
          >
            {progress.isOver
              ? `${money.format(Math.abs(progress.remaining ?? 0))} over budget`
              : `${money.format(progress.remaining ?? 0)} left`}
          </p>
        </div>
      ) : (
        <p className="text-sm text-text-secondary">
          No budget set for this trip.
        </p>
      )}

      {categories.length > 0 && (
        <ul className="flex flex-col gap-2 border-t border-surface-border pt-3">
          {categories.map(({ category, amount }) => (
            <li key={category} className="flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <span className="capitalize text-text-primary">{category}</span>
                <span className="text-text-secondary">
                  {money.format(amount)}
                </span>
              </div>
              <div className="w-full bg-surface-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-brand-secondary h-full rounded-full"
                  style={{ width: `${spent ? (amount / spent) * 100 : 0}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
