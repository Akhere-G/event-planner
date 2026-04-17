import type { Event } from "../types";
import type { EventSchema } from "../schemas/eventSchema";
import { apiSlice } from "../../api/apiSlice";

export const eventApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addEvent: builder.mutation<Event, { tripId: number; event: EventSchema }>({
      query: ({ tripId, event }) => ({
        url: `/itineraries/${tripId}/events`,
        method: "POST",
        body: event,
      }),
      invalidatesTags: (_, __, { tripId }) => [
        { type: "Trips", id: "LIST" },
        { type: "Trips", id: tripId },
      ],
    }),
  }),
});

export const { useAddEventMutation } = eventApi;
