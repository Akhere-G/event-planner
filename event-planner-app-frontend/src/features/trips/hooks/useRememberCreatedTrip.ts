import { usePostHog } from "@posthog/react";
import { differenceInDays } from "date-fns";
import { anonymousAccessCodeStorageKey } from "../../api/apiSlice";
import type { Trip } from "../types";

export type TripCreationSource = "form" | "prompt";

export default function useRememberCreatedTrip() {
  const posthog = usePostHog();

  return (trip: Trip, source: TripCreationSource) => {
    posthog?.capture("trip_created", {
      trip_id: trip.id,
      name: trip.name,
      startDate: trip.startDate,
      endDate: trip.endDate,
      destination: trip.destination,
      duration_days: differenceInDays(
        new Date(trip.endDate),
        new Date(trip.startDate),
      ),
      source,
    });
    if (trip.anonymousAccessCode) {
      localStorage.setItem(
        anonymousAccessCodeStorageKey,
        JSON.stringify({
          anonymousAccessCode: trip.anonymousAccessCode,
          tripId: trip.id,
        }),
      );
    }
  };
}
