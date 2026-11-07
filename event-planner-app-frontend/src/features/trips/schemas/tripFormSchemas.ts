import type { Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import type { ObjectSchema } from "yup";
import { tripSchema, type TripSchema } from "./tripSchema";
import {
  budgetStepSchema,
  editPreferencesSchema,
  vibeStepSchema,
  whoStepSchema,
  type PreferencesInput,
} from "./preferencesSchema";

export type TripFormValues = Omit<TripSchema, "budgetAmountGbp"> &
  PreferencesInput & { budgetAmountGbp: number | null };

export const TRIP_STEPS = [
  "Where & when",
  "Who's going",
  "Vibe",
  "Budget",
  "Review",
] as const;

/** Budget amount is validated on the budget step, not with the trip basics. */
const basicsStepSchema = tripSchema.omit(["budgetAmountGbp"]);

/** One schema per step; the review step validates everything together. */
export const stepSchemas = [
  basicsStepSchema,
  whoStepSchema,
  vibeStepSchema,
  budgetStepSchema,
  basicsStepSchema
    .concat(whoStepSchema)
    .concat(vibeStepSchema)
    .concat(budgetStepSchema),
] as const;

export const editFormSchema = tripSchema.concat(editPreferencesSchema);

export function makeResolver(
  getSchema: () => ObjectSchema<object>,
): Resolver<TripFormValues> {
  return (values, context, options) =>
    yupResolver(getSchema() as unknown as ObjectSchema<TripFormValues>)(
      values,
      context,
      options,
    );
}

export function splitFormValues(values: TripFormValues): {
  trip: TripSchema;
  preferences: PreferencesInput;
} {
  const {
    tripType,
    groupSize,
    vibes,
    budgetTier,
    pace,
    interests,
    transport,
    ...trip
  } = values;
  return {
    trip,
    preferences: {
      tripType,
      groupSize,
      vibes,
      budgetTier,
      pace,
      interests,
      transport,
    },
  };
}
