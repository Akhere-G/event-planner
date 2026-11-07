import { Stepper } from "../../../components";
import { TRIP_STEPS } from "../schemas/tripFormSchemas";
import type { PreferencesInput } from "../schemas/preferencesSchema";
import type { TripSchema } from "../schemas/tripSchema";
import {
  LAST_STEP,
  useTripForm,
  type TripSubmitAction,
} from "../hooks/useTripForm";
import BasicsStep from "./steps/BasicsStep";
import BudgetStep from "./steps/BudgetStep";
import ReviewStep from "./steps/ReviewStep";
import TransportStep from "./steps/TransportStep";
import VibeStep from "./steps/VibeStep";
import WhoStep from "./steps/WhoStep";

export type { TripSubmitOptions } from "../hooks/useTripForm";

interface TripFormProps {
  initialData?: Partial<TripSchema>;
  initialPreferences?: Partial<PreferencesInput>;
  submitAction: TripSubmitAction;
  submitBtnText: string;
  isLoading: boolean;
  /** "stepper" is a guided multi-step flow; "single" shows everything on one page. */
  variant?: "stepper" | "single";
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
  const {
    form,
    defaultValues,
    errorMessage,
    step,
    goTo,
    handleNext,
    submitWith,
  } = useTripForm({ initialData, initialPreferences, isStepper, submitAction });
  const { register, control, setValue, getValues, formState } = form;

  const fieldProps = {
    register,
    setValue,
    control,
    errors: formState.errors,
  };
  const basics = (
    <BasicsStep
      {...fieldProps}
      getValues={getValues}
      initialDestination={defaultValues.destination}
      validateOnPlaceSelect={formState.isSubmitted}
    />
  );
  const errorBanner = errorMessage && (
    <p className="errorMessage">{errorMessage}</p>
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
        {errorBanner}
        {basics}
        <h3 className="title mt-2">Preferences</h3>
        <WhoStep {...fieldProps} />
        <VibeStep {...fieldProps} />
        <BudgetStep {...fieldProps} />
        <TransportStep {...fieldProps} />
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
      {errorBanner}

      {step === 0 && basics}
      {step === 1 && <WhoStep {...fieldProps} />}
      {step === 2 && <VibeStep {...fieldProps} />}
      {step === 3 && <BudgetStep {...fieldProps} />}
      {step === 4 && <ReviewStep values={getValues()} />}

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
