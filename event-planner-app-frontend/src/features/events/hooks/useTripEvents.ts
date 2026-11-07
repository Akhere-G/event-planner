import { skipToken } from "@reduxjs/toolkit/query";
import { useGetTripQuery } from "../../trips/services/tripsApiSlice";
import type { Event } from "../types";
import { useGetEventsQuery } from "../service/eventApiSlice";

const NO_EVENTS: Event[] = [];

/**
 * The trip's events, in the trip's timezone. Fetched on their own (rather than
 * read from the trip) so a change to events never refetches the trip, and so the
 * list keeps stable references for events that did not change.
 */
export default function useTripEvents(tripId: number) {
  const trip = useGetTripQuery(tripId);
  const timezone = trip.data?.data?.timezone;

  const query = useGetEventsQuery(timezone ? { tripId, timezone } : skipToken);

  return {
    events: query.data?.data.events ?? NO_EVENTS,
    isLoading: query.isLoading || trip.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
  };
}
