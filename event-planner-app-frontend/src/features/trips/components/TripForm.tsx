import {
  addDays,
  addMilliseconds,
  addMonths,
  differenceInMilliseconds,
  format,
  isValid,
} from "date-fns";
import {
  FormInput,
  FormTextarea,
  LocationInput,
  Stepper,
} from "../../../components";
import { isValidationError } from "../../api/utils";
import type { TripSchema } from "../schemas/tripSchema";
import type { PreferencesInput } from "../schemas/preferencesSchema";
import {
  TRIP_STEPS,
  editFormSchema,
  makeResolver,
  splitFormValues,
  stepSchemas,
  type TripFormValues,
} from "../schemas/tripFormSchemas";
import { emptyPreferences } from "../preferenceUtils";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import {
  BudgetFields,
  TransportFields,
  VibeFields,
  WhoFields,
} from "./PreferenceFields";
import TripReview from "./TripReview";

export interface TripSubmitOptions {
  generateWithAi: boolean;
}

interface TripFormProps {
  initialData?: Partial<TripSchema>;
  initialPreferences?: Partial<PreferencesInput>;
  submitAction: (
    trip: TripSchema,
    preferences: PreferencesInput,
    options: TripSubmitOptions,
  ) => Promise<void>;
  submitBtnText: string;
  isLoading: boolean;
  /** "stepper" is a guided multi-step flow; "single" shows everything on one page. */
  variant?: "stepper" | "single";
}

const LAST_STEP = TRIP_STEPS.length - 1;

function buildDefaults(
  initialData: Partial<TripSchema>,
  initialPreferences: Partial<PreferencesInput>,
): TripFormValues {
  const defaultStart = addMonths(new Date(), 4);
  const defaultEnd = addDays(defaultStart, 7);
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
    groupSize:
      initialPreferences.groupSize ?? (initialPreferences.tripType ? null : 1),
    ...Object.fromEntries(
      Object.entries(initialPreferences).filter(([key]) => key !== "groupSize"),
    ),
  };
}

export default function TripForm({
  initialData = {},
  initialPreferences = {},
  submitAction,
  submitBtnText,
  isLoading,
  variant = "stepper",
}: TripFormProps) {
  const isStepper = variant === "stepper";
  const [errorMessage, setErrorMessage] = useState("");
  const [step, setStep] = useState(0);
  const [defaultValues] = useState(() =>
    buildDefaults(initialData, initialPreferences),
  );

  const {
    register,
    formState,
    handleSubmit,
    setError,
    setValue,
    getValues,
    watch,
    trigger,
  } = useForm<TripFormValues>({
    defaultValues,
    resolver: makeResolver(() =>
      isStepper ? stepSchemas[step] : editFormSchema,
    ),
  });

  const goTo = (next: number) => {
    setStep(next);
  };

  const handleNext = async () => {
    if (await trigger()) goTo(Math.min(step + 1, LAST_STEP));
  };

  const submitWith = (generateWithAi: boolean) =>
    handleSubmit(async (values) => {
      const { trip, preferences } = splitFormValues(values);
      const formattedTrip = {
        ...trip,
        description: trip.description,
        startDate: format(trip.startDate, "yyyy-MM-dd"),
        endDate: format(trip.endDate, "yyyy-MM-dd"),
        budgetAmountGbp: trip.budgetAmountGbp ?? null,
      };

      try {
        await submitAction(formattedTrip, preferences, { generateWithAi });
      } catch (err) {
        if (isValidationError(err)) {
          const serverErrors = err.data.error;

          setErrorMessage(serverErrors.general?.join(", ") ?? "");

          Object.entries(serverErrors).forEach(([key, messages]) => {
            setError(key as keyof TripFormValues, {
              type: "server",
              message: messages[0],
            });
          });
          if (isStepper) goTo(0);
        } else {
          toast.error("Sorry! Something went wrong...");
        }
      }
    })();

  const onStartChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
      Element
    >,
  ) => {
    const newStartStr = e.target.value;
    const currentStartStr = getValues("startDate");
    const currentEndStr = getValues("endDate");

    const currentStart = new Date(currentStartStr);
    const currentEnd = new Date(currentEndStr);
    const nextStart = new Date(newStartStr);

    if (isValid(currentStart) && isValid(currentEnd) && isValid(nextStart)) {
      const duration = differenceInMilliseconds(currentEnd, currentStart);

      const nextEnd = addMilliseconds(nextStart, duration);

      setValue("endDate", format(nextEnd, "yyyy-MM-dd"));
    } else if (isValid(nextStart)) {
      const nextEnd = addDays(nextStart, 7);

      setValue("endDate", format(nextEnd, "yyyy-MM-dd"));
    }

    setValue("startDate", newStartStr);
  };

  const fieldProps = {
    register,
    watch,
    setValue,
    errors: formState.errors,
  };

  const basicsFields = (
    <>
      <LocationInput
        name="location"
        label="Destination"
        initialValue={defaultValues.destination}
        errorMessage={formState.errors.destination?.message}
        searchTypes={["political"]}
        onPlaceSelect={(place) => {
          if (!place.formatted_address || !place.geometry?.location) return;
          setValue("destination", place.formatted_address, {
            shouldValidate: formState.isSubmitted,
          });
          setValue("name", `${place.name} ${new Date().getFullYear()}`);
          setValue("latitude", place.geometry.location.lat());
          setValue("longitude", place.geometry.location.lng());
        }}
      />
      <FormInput
        label="Name"
        {...register("name")}
        errorMessage={formState.errors.name?.message}
      />
      <FormTextarea
        label="Description"
        {...register("description")}
        errorMessage={formState.errors.description?.message}
      />
      <FormInput
        label="Start Date"
        type="date"
        {...register("startDate")}
        errorMessage={formState.errors.startDate?.message}
        onChange={onStartChange}
      />
      <FormInput
        label="End Date"
        type="date"
        {...register("endDate")}
        errorMessage={formState.errors.endDate?.message}
      />
    </>
  );

  if (!isStepper) {
    return (
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          void submitWith(false);
        }}
      >
        {errorMessage && <p className="errorMessage">{errorMessage}</p>}
        {basicsFields}
        <h3 className="title mt-2">Preferences</h3>
        <WhoFields {...fieldProps} />
        <VibeFields {...fieldProps} />
        <BudgetFields {...fieldProps} />
        <TransportFields {...fieldProps} />
        <button className="btn-primary mt-2" disabled={isLoading}>
          {submitBtnText}
        </button>
      </form>
    );
  }

  const isLastStep = step === LAST_STEP;

  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!isLastStep) void handleNext();
      }}
    >
      <Stepper steps={[...TRIP_STEPS]} currentStep={step} onStepClick={goTo} />
      {errorMessage && <p className="errorMessage">{errorMessage}</p>}

      {step === 0 && basicsFields}
      {step === 1 && <WhoFields {...fieldProps} />}
      {step === 2 && <VibeFields {...fieldProps} />}
      {step === 3 && <BudgetFields {...fieldProps} />}
      {step === 4 && <TripReview values={getValues()} />}

      <div className="flex gap-2 justify-between mt-2 flex-wrap">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => goTo(step - 1)}
          disabled={step === 0 || isLoading}
        >
          Back
        </button>
        {isLastStep ? (
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              className="btn-secondary"
              disabled={isLoading}
              onClick={() => void submitWith(false)}
            >
              {submitBtnText}
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={isLoading}
              onClick={() => void submitWith(true)}
            >
              {submitBtnText} &amp; generate with AI
            </button>
          </div>
        ) : (
          <button type="submit" className="btn-primary">
            Next
          </button>
        )}
      </div>
    </form>
  );
}
