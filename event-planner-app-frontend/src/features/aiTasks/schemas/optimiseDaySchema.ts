import * as yup from "yup";
import type { OptimiseDayParams, OptimiseGoal } from "../types";

export const MAX_INSTRUCTIONS_LENGTH = 500;

export const OPTIMISE_GOALS: {
  value: OptimiseGoal;
  label: string;
  hint: string;
}[] = [
  {
    value: "minimise_travel",
    label: "Minimise travel",
    hint: "Order events so the trips between them are short.",
  },
  {
    value: "group_by_area",
    label: "Group by neighbourhood",
    hint: "Keep events in the same area together.",
  },
  {
    value: "respect_opening_hours",
    label: "Respect opening hours",
    hint: "Only schedule venues while they are open.",
  },
];

export const PACE_CHOICES = [
  { value: "", label: "Keep as is" },
  { value: "relaxed", label: "Relaxed" },
  { value: "balanced", label: "Balanced" },
  { value: "packed", label: "Packed" },
];

const time = /^([01]\d|2[0-3]):([0-5]\d)$/;
const timeOrEmpty = (message: string) =>
  yup
    .string()
    .defined()
    .test("time", message, (value) => !value || time.test(value));

export const optimiseDaySchema = yup.object({
  dates: yup
    .array(yup.string().defined())
    .defined()
    .min(1, "Choose at least one day."),
  goals: yup
    .array(
      yup
        .string()
        .oneOf(OPTIMISE_GOALS.map((goal) => goal.value))
        .defined(),
    )
    .defined(),
  pace: yup.string().defined(),
  dayStart: timeOrEmpty("Use HH:MM."),
  dayEnd: timeOrEmpty("Use HH:MM.").test(
    "after-start",
    "The day must end after it starts.",
    function (value) {
      const { dayStart } = this.parent;
      return !value || !dayStart || value > dayStart;
    },
  ),
  lockedEventIds: yup.array(yup.number().defined()).defined(),
  allowAddRemove: yup.boolean().defined(),
  instructions: yup
    .string()
    .defined()
    .max(
      MAX_INSTRUCTIONS_LENGTH,
      `Keep it under ${MAX_INSTRUCTIONS_LENGTH} characters.`,
    ),
});

export type OptimiseDaySchema = yup.InferType<typeof optimiseDaySchema>;

export const optimiseParamsFromForm = (
  values: OptimiseDaySchema,
  validEventIds: ReadonlySet<number>,
): OptimiseDayParams => ({
  dates: [...values.dates].sort(),
  goals: values.goals as OptimiseGoal[],
  pace: values.pace || null,
  dayStart: values.dayStart || null,
  dayEnd: values.dayEnd || null,
  // Events on days that were unticked after being locked no longer matter.
  lockedEventIds: values.lockedEventIds.filter((id) => validEventIds.has(id)),
  allowAddRemove: values.allowAddRemove,
  instructions: values.instructions.trim(),
});
