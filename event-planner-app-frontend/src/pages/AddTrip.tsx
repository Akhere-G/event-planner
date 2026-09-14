import { useNavigate } from "react-router";
import TripForm from "../features/trips/components/TripForm";
import type { TripSchema } from "../features/trips/schemas/tripSchema";
import { useAddTripMutation } from "../features/trips/services/tripsApiSlice";
import { usePostHog } from "@posthog/react";
import { differenceInDays } from "date-fns";
import { isValidationError } from "../features/api/utils";
import { toast } from "sonner";
import { anonymousAccessCodeStorageKey } from "../features/api/apiSlice";

import useLoadAnonTrip from "../features/trips/hooks/useLoadAnonTrip";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function Addtrip() {
  const [addTrip, { isLoading }] = useAddTripMutation();
  const navigate = useNavigate();
  const posthog = usePostHog();

  const { anonTrip } = useLoadAnonTrip();

  async function onSubmit(trip: TripSchema) {
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
          submitBtnText="Add Trip"
          isLoading={isLoading || !!anonTrip}
        />
      </div>
    </div>
  );
}
