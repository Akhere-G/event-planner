import { addDays, addMonths, format } from "date-fns";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { isValidationError } from "../../api/utils";
import { emptyPreferences } from "../preferenceUtils";
import type { PreferencesInput } from "../schemas/preferencesSchema";
import {
  TRIP_STEPS,
  editFormSchema,
  makeResolver,
  splitFormValues,
  stepSchemas,
  type TripFormValues,
} from "../schemas/tripFormSchemas";
import type { TripSchema } from "../schemas/tripSchema";

export interface TripSubmitOptions {
  generateWithAi: boolean;
}

export type TripSubmitAction = (
  trip: TripSchema,
  preferences: PreferencesInput,
  options: TripSubmitOptions,
) => Promise<void>;

export const LAST_STEP = TRIP_STEPS.length - 1;

export function buildDefaults(
  initialData: Partial<TripSchema>,
  initialPreferences: Partial<PreferencesInput>,
): TripFormValues {
  const defaultStart = addMonths(new Date(), 4);
  const defaultEnd = addDays(defaultStart, 7);
  const { groupSize, ...otherPreferences } = initialPreferences;
  return {
    name: initialData.name ?? "",
    destination: initialData.destination ?? "",
    description: initialData.description ?? "",
    latitude: initialData.latitude ?? 0,
    longitude: initialData.longitude ?? 0,
    startDate: initialData.startDate ?? format(defaultStart, "yyyy-MM-dd"),
    endDate: initialData.endDate ?? format(defaultEnd, "yyyy-MM-dd"),
    budgetAmountGbp: initialData.budgetAmountGbp ?? null,
    ...emptyPreferences,
    groupSize: groupSize ?? (initialPreferences.tripType ? null : 1),
    ...otherPreferences,
  };
}

interface UseTripFormOptions {
  initialData: Partial<TripSchema>;
  initialPreferences: Partial<PreferencesInput>;
  isStepper: boolean;
  submitAction: TripSubmitAction;
}

export function useTripForm({
  initialData,
  initialPreferences,
  isStepper,
  submitAction,
}: UseTripFormOptions) {
  const [errorMessage, setErrorMessage] = useState("");
  const [step, setStep] = useState(0);
  const [defaultValues] = useState(() =>
    buildDefaults(initialData, initialPreferences),
  );

  const form = useForm<TripFormValues>({
    defaultValues,
    resolver: makeResolver(() =>
      isStepper ? stepSchemas[step] : editFormSchema,
    ),
  });
  const { handleSubmit, setError, trigger } = form;

  const handleNext = async () => {
    if (await trigger()) setStep(Math.min(step + 1, LAST_STEP));
  };

  const showServerErrors = (serverErrors: Record<string, string[]>) => {
    setErrorMessage(serverErrors.general?.join(", ") ?? "");
    Object.entries(serverErrors).forEach(([key, messages]) => {
      setError(key as keyof TripFormValues, {
        type: "server",
        message: messages[0],
      });
    });
    if (isStepper) setStep(0);
  };

  const submitWith = (generateWithAi: boolean) =>
    handleSubmit(async (values) => {
      const { trip, preferences } = splitFormValues(values);
      const formattedTrip = {
        ...trip,
        startDate: format(trip.startDate, "yyyy-MM-dd"),
        endDate: format(trip.endDate, "yyyy-MM-dd"),
        budgetAmountGbp: trip.budgetAmountGbp ?? null,
      };

      try {
        await submitAction(formattedTrip, preferences, { generateWithAi });
      } catch (err) {
        if (isValidationError(err)) showServerErrors(err.data.error);
        else toast.error("Sorry! Something went wrong...");
      }
    })();

  return {
    form,
    defaultValues,
    errorMessage,
    step,
    goTo: setStep,
    handleNext,
    submitWith,
  };
}
