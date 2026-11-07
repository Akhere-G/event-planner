import { useNavigate } from "react-router";
import TripForm from "../features/trips/components/TripForm";
import type { TripSchema } from "../features/trips/schemas/tripSchema";
import type { PreferencesInput } from "../features/trips/schemas/preferencesSchema";
import type { TripSubmitOptions } from "../features/trips/components/TripForm";
import { useSavePreferencesMutation } from "../features/trips/services/preferencesApiSlice";
import { usePreviewGeneratedTripMutation } from "../features/ai/services/aiApiSlice";
import { ChangePreviewModal } from "../features/ai/components";
import type { ChangeOp } from "../features/ai/types";
import { useState } from "react";
import { useAddTripMutation } from "../features/trips/services/tripsApiSlice";
import { usePostHog } from "@posthog/react";
import { differenceInDays } from "date-fns";
import { isApiError, isValidationError } from "../features/api/utils";
import { toast } from "sonner";
import { rememberAnonymousTrip } from "../features/api/apiSlice";

import useLoadAnonTrip from "../features/trips/hooks/useLoadAnonTrip";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { InfoIcon } from "lucide-react";
import { TripBuilderChat } from "../features/tripBuilder/components";

export default function Addtrip() {
  const [addTrip, { isLoading }] = useAddTripMutation();
  const navigate = useNavigate();
  const posthog = usePostHog();

  const [savePreferences, { isLoading: isSavingPreferences }] =
    useSavePreferencesMutation();
  const [previewGeneratedTrip, { isLoading: isGenerating }] =
    usePreviewGeneratedTripMutation();
  const [generated, setGenerated] = useState<{
    tripId: number;
    timezone: string;
    ops: ChangeOp[];
  } | null>(null);

  const [isManual, setIsManual] = useState(false);
  const { anonTrip } = useLoadAnonTrip();

  async function generatePlan(tripId: number, timezone: string) {
    try {
      const { data } = await previewGeneratedTrip({ tripId }).unwrap();
      if (!data.ops.length) {
        toast.info(
          "The AI had no suggestions this time. You can add things yourself.",
        );
        navigate(`/trips/${tripId}`);
        return;
      }
      setGenerated({ tripId, timezone, ops: data.ops });
    } catch (err) {
      posthog?.captureException(err);
      toast.error(
        isApiError(err) ? err.data.message : "Could not generate a plan.",
      );
      navigate(`/trips/${tripId}`);
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
        rememberAnonymousTrip(tripId, anonymousAccessCode);
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
        await generatePlan(tripId, newTrip.data.timezone);
        return;
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
        <button
          type="button"
          className="btn-secondary mb-4"
          onClick={() => setIsManual((manual) => !manual)}
        >
          {isManual ? "Plan with AI" : "Add manually"}
        </button>
        {isManual ? (
          <TripForm
            submitAction={onSubmit}
            submitBtnText="Create"
            isLoading={
              isLoading || isSavingPreferences || isGenerating || !!anonTrip
            }
          />
        ) : (
          <TripBuilderChat disabled={!!anonTrip} />
        )}
        {generated && (
          <ChangePreviewModal
            open
            onOpenChange={(open) => {
              if (!open) navigate(`/trips/${generated.tripId}`);
            }}
            tripId={generated.tripId}
            timezone={generated.timezone}
            ops={generated.ops}
            events={[]}
            title="Review your AI trip plan"
            onApplied={() =>
              posthog?.capture("ai_trip_generated", {
                trip_id: generated.tripId,
              })
            }
          />
        )}
      </div>
    </div>
  );
}
