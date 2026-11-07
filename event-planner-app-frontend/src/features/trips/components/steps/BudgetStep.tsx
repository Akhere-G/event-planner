import { Users } from "lucide-react";
import { FormInput, ToggleButton } from "../../../../components";
import { BUDGET_TIERS, BUDGET_TIER_LABELS } from "../../constants";
import Label from "./Label";
import type { FieldGroupProps } from "./fieldTypes";
import { useWatch } from "react-hook-form";

export default function BudgetStep({
  register,
  control,
  setValue,
  errors,
}: FieldGroupProps) {
  const tier = useWatch({ name: "budgetTier", control });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>Budget tier</Label>
        <div className="grid grid-cols-3 gap-2">
          {BUDGET_TIERS.map((option) => (
            <ToggleButton
              key={option}
              label={BUDGET_TIER_LABELS[option]}
              value={option}
              isSelected={tier === option}
              icon={Users}
              onClick={() =>
                setValue("budgetTier", tier === option ? null : option)
              }
            />
          ))}
        </div>
      </div>
      <FormInput
        label="Total budget in GBP (optional)"
        type="number"
        min={0}
        step="0.01"
        {...register("budgetAmountGbp")}
        errorMessage={errors.budgetAmountGbp?.message}
      />
    </div>
  );
}
