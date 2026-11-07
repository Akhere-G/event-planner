import {
  Baby,
  Footprints,
  Heart,
  PartyPopper,
  Users,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";
import { FormInput, ToggleButton } from "../../../../components";
import { TRIP_TYPES, TRIP_TYPE_LABELS } from "../../constants";
import Label from "./Label";
import type { FieldGroupProps } from "./fieldTypes";

const TRIP_TYPE_ICONS: Record<
  (typeof TRIP_TYPES)[number],
  ComponentType<LucideProps>
> = {
  solo: Footprints,
  couple: Heart,
  friends: PartyPopper,
  family: Baby,
};

export default function WhoStep({
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
