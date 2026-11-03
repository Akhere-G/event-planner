import * as yup from "yup";
import {
  BUDGET_TIERS,
  MAX_GROUP_SIZE,
  PACES,
  TRANSPORTS,
  TRIP_TYPES,
} from "../constants";

const emptyToNull = (value: unknown, original: unknown) =>
  original === "" || original === null || original === undefined ? null : value;

const optionalNumber = (min: number) =>
  yup
    .number()
    .transform(emptyToNull)
    .typeError("Enter a number.")
    .min(min, `Must be at least ${min}.`)
    .nullable();

export const whoStepSchema = yup.object({
  tripType: yup
    .mixed<(typeof TRIP_TYPES)[number]>()
    .oneOf(TRIP_TYPES, "Choose who is going.")
    .required("Choose who is going."),
  groupSize: yup
    .number()
    .typeError("Enter the number of people.")
    .integer("Enter a whole number.")
    .min(1, "At least one person is going.")
    .max(MAX_GROUP_SIZE, `Up to ${MAX_GROUP_SIZE} people.`)
    .required("Enter the number of people."),
});

export const vibeStepSchema = yup.object({
  vibes: yup.array(yup.string().required()).max(10).default([]),
  pace: yup
    .mixed<(typeof PACES)[number]>()
    .oneOf(PACES)
    .nullable()
    .default(null),
});

export const budgetStepSchema = yup.object({
  budgetTier: yup
    .mixed<(typeof BUDGET_TIERS)[number]>()
    .oneOf(BUDGET_TIERS)
    .nullable()
    .default(null),
  budgetAmountGbp: optionalNumber(0).default(null),
});

/** Preferences are all optional when edited on a single page. */
export const editPreferencesSchema = yup.object({
  tripType: yup
    .mixed<(typeof TRIP_TYPES)[number]>()
    .oneOf(TRIP_TYPES)
    .nullable()
    .default(null),
  groupSize: optionalNumber(1)
    .integer("Enter a whole number.")
    .max(MAX_GROUP_SIZE, `Up to ${MAX_GROUP_SIZE} people.`)
    .default(null),
  vibes: yup.array(yup.string().required()).max(10).default([]),
  pace: yup
    .mixed<(typeof PACES)[number]>()
    .oneOf(PACES)
    .nullable()
    .default(null),
  budgetTier: budgetStepSchema.fields.budgetTier,
  budgetAmountGbp: budgetStepSchema.fields.budgetAmountGbp,
  transport: yup
    .mixed<(typeof TRANSPORTS)[number]>()
    .oneOf(TRANSPORTS)
    .nullable()
    .default(null),
  interests: yup.array(yup.string().required()).max(15).default([]),
});

export type PreferencesInput = {
  tripType: (typeof TRIP_TYPES)[number] | null;
  groupSize: number | null;
  vibes: string[];
  budgetTier: (typeof BUDGET_TIERS)[number] | null;
  pace: (typeof PACES)[number] | null;
  interests: string[];
  transport: (typeof TRANSPORTS)[number] | null;
};
