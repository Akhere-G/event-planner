import type { ComponentType } from "react";
import {
  Baby,
  Footprints,
  Heart,
  PartyPopper,
  Users,
  type LucideProps,
} from "lucide-react";
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { FormInput, ToggleButton } from "../../../components";
import {
  BUDGET_TIERS,
  BUDGET_TIER_LABELS,
  PACES,
  PACE_LABELS,
  TRANSPORTS,
  TRANSPORT_LABELS,
  TRIP_TYPES,
  TRIP_TYPE_LABELS,
  VIBE_OPTIONS,
} from "../constants";
import type { TripFormValues } from "../schemas/tripFormSchemas";

export interface FieldGroupProps {
  register: UseFormRegister<TripFormValues>;
  watch: UseFormWatch<TripFormValues>;
  setValue: UseFormSetValue<TripFormValues>;
  errors: FieldErrors<TripFormValues>;
}

const TRIP_TYPE_ICONS: Record<
  (typeof TRIP_TYPES)[number],
  ComponentType<LucideProps>
> = {
  solo: Footprints,
  couple: Heart,
  friends: PartyPopper,
  family: Baby,
};

function Label({ children }: { children: string }) {
  return <p className="text-sm font-semibold text-text-primary">{children}</p>;
}

function toggleInList(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export function WhoFields({
  register,
  watch,
  setValue,
  errors,
}: FieldGroupProps) {
  const tripType = watch("tripType");
  return (
    <div className="flex flex-col gap-3">
      <Label>Who is going?</Label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TRIP_TYPES.map((type) => (
          <ToggleButton
            key={type}
            label={TRIP_TYPE_LABELS[type]}
            value={type}
            isSelected={tripType === type}
            icon={TRIP_TYPE_ICONS[type] ?? Users}
            onClick={() => setValue("tripType", type, { shouldValidate: true })}
          />
        ))}
      </div>
      {errors.tripType && (
        <p className="text-xs text-error">{errors.tripType.message}</p>
      )}
      <FormInput
        label="Number of people"
        type="number"
        min={1}
        {...register("groupSize")}
        errorMessage={errors.groupSize?.message}
      />
    </div>
  );
}

export function VibeFields({ watch, setValue }: FieldGroupProps) {
  const vibes = watch("vibes") ?? [];
  const pace = watch("pace");
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>What vibe are you after? (pick any)</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {VIBE_OPTIONS.map((option) => (
            <ToggleButton
              key={option.value}
              label={option.label}
              value={option.value}
              isSelected={vibes.includes(option.value)}
              icon={Users}
              onClick={(value) => setValue("vibes", toggleInList(vibes, value))}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label>Pace</Label>
        <div className="grid grid-cols-3 gap-2">
          {PACES.map((option) => (
            <ToggleButton
              key={option}
              label={PACE_LABELS[option]}
              value={option}
              isSelected={pace === option}
              icon={Users}
              onClick={() => setValue("pace", pace === option ? null : option)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function BudgetFields({
  register,
  watch,
  setValue,
  errors,
}: FieldGroupProps) {
  const tier = watch("budgetTier");
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

/** Extra preferences that only appear on the single-page edit form. */
export function TransportFields({ watch, setValue }: FieldGroupProps) {
  const transport = watch("transport");
  return (
    <div className="flex flex-col gap-2">
      <Label>Getting around</Label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TRANSPORTS.map((option) => (
          <ToggleButton
            key={option}
            label={TRANSPORT_LABELS[option]}
            value={option}
            isSelected={transport === option}
            icon={Footprints}
            onClick={() =>
              setValue("transport", transport === option ? null : option)
            }
          />
        ))}
      </div>
    </div>
  );
}
