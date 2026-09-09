import { useNavigate } from "react-router";
import TripForm from "../features/trips/components/TripForm";
import type { TripSchema } from "../features/trips/schemas/tripSchema";
import { useAddTripMutation } from "../features/trips/services/tripsApiSlice";
import { usePostHog } from "@posthog/react";
import { differenceInDays } from "date-fns";
import { isValidationError } from "../features/api/utils";
import { toast } from "sonner";

export default function Addtrip() {
  const [addTrip, { isLoading }] = useAddTripMutation();
  const navigate = useNavigate();
  const posthog = usePostHog();

  async function onSubmit(trip: TripSchema) {
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
      navigate("/");
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
        <TripForm
          submitAction={onSubmit}
          submitBtnText="Add Trip"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
