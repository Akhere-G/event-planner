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
    updateEvent: builder.mutation<
      void,
      { tripId: number; eventId: number; updatedEvent: Partial<Event> }
    >({
      query: ({ tripId, eventId, updatedEvent }) => ({
        url: `/itineraries/${tripId}/events/${eventId}`,
        method: "PATCH",
        body: updatedEvent,
      }),
      invalidatesTags: (_, __, { tripId }) => [
        { type: "Trips", id: "LIST" },
        { type: "Trips", id: tripId },
      ],
    }),
    deleteEvent: builder.mutation<void, { tripId: number; eventId: number }>({
      query: ({ tripId, eventId }) => ({
        url: `/itineraries/${tripId}/events/${eventId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, { tripId }) => [
        { type: "Trips", id: "LIST" },
        { type: "Trips", id: tripId },
      ],
    }),
  }),
});

export const {
  useAddEventMutation,
  useDeleteEventMutation,
  useUpdateEventMutation,
} = eventApi;
