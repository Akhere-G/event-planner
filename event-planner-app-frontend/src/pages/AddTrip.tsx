import { useNavigate } from "react-router";
import TripForm from "../features/trips/components/TripForm";
import type { TripSchema } from "../features/trips/schemas/tripSchema";
import type { PreferencesInput } from "../features/trips/schemas/preferencesSchema";
import type { TripSubmitOptions } from "../features/trips/components/TripForm";
import { useSavePreferencesMutation } from "../features/trips/services/preferencesApiSlice";
import { useCreateAiTaskMutation } from "../features/aiTasks/services/aiTaskApiSlice";
import { useAddTripMutation } from "../features/trips/services/tripsApiSlice";
import { usePostHog } from "@posthog/react";
import { differenceInDays } from "date-fns";
import { isApiError, isValidationError } from "../features/api/utils";
import { toast } from "sonner";
import { anonymousAccessCodeStorageKey } from "../features/api/apiSlice";

import useLoadAnonTrip from "../features/trips/hooks/useLoadAnonTrip";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function Addtrip() {
  const [addTrip, { isLoading }] = useAddTripMutation();
  const navigate = useNavigate();
  const posthog = usePostHog();

  const [savePreferences, { isLoading: isSavingPreferences }] =
    useSavePreferencesMutation();
  const [createAiTask, { isLoading: isQueueingGeneration }] =
    useCreateAiTaskMutation();

  const { anonTrip } = useLoadAnonTrip();

  /** The plan is made in the background: go to the trip and watch it there. */
  async function queueGeneration(tripId: number) {
    try {
      await createAiTask({ tripId, type: "generate_trip" }).unwrap();
      toast.success(
        "Planning your trip. We'll let you know when it's ready to review.",
      );
    } catch (err) {
      posthog?.captureException(err);
      toast.error(
        isApiError(err) ? err.data.message : "Could not start planning your trip.",
      );
    }
  }

  async function onSubmit(
    trip: TripSchema,
    preferences: PreferencesInput,
    { generateWithAi }: TripSubmitOptions,
  ) {
    if (anonTrip) {
      toast.warning(
        "You already created one trip. Create an account to save your trip and create more trips.",
      );
      return;
    }
    try {
      const newTrip = await addTrip(trip).unwrap();
      posthog?.capture("trip_created", {
        trip_id: newTrip.data.id,
        name: trip.name,
        startDate: trip.startDate,
        endDate: trip.endDate,
        destination: trip.destination,
        duration_days: differenceInDays(
          new Date(trip.endDate),
          new Date(trip.startDate),
        ),
      });
      const tripId = newTrip.data.id;
      const anonymousAccessCode = newTrip.data.anonymousAccessCode;
      if (anonymousAccessCode) {
        localStorage.setItem(
          anonymousAccessCodeStorageKey,
          JSON.stringify({
            anonymousAccessCode,
            tripId,
          }),
        );
      }
      toast.success("Trip created.");

      try {
        await savePreferences({ tripId, preferences }).unwrap();
      } catch (prefsErr) {
        posthog?.captureException(prefsErr);
        toast.warning(
          "Your trip was created, but we couldn't save your preferences.",
        );
        navigate(`/trips/${tripId}`);
        return;
      }

      if (generateWithAi) {
        await queueGeneration(tripId);
      }
      navigate(`/trips/${tripId}`);
    } catch (err) {
      if (isValidationError(err)) {
        posthog?.captureException(err, {
          feature: "trip_creation",
          action: "trip_created",
        });
      } else {
        posthog?.captureException(err);
        toast.error("Sorry! Something went wrong...");
      }

      throw err;
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h2 className="title mb-4">Add Trip</h2>
        {anonTrip && (
          <Alert variant="destructive" className="mb-2">
            <InfoIcon />
            <AlertTitle className="inline">
              Log in to create multiple trips
            </AlertTitle>
            <AlertDescription>
              You already created one trip. Create an account to save your trip
              and create more trips.
            </AlertDescription>
          </Alert>
        )}
        <TripForm
          submitAction={onSubmit}
          submitBtnText="Create"
          isLoading={
            isLoading ||
            isSavingPreferences ||
            isQueueingGeneration ||
            !!anonTrip
          }
        />
      </div>
    </div>
  );
}
