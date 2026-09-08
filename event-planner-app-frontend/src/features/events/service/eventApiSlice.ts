import type { Event } from "../types";
import type { EventSchema } from "../schemas/eventSchema";
import { apiSlice } from "../../api/apiSlice";
import type { ApiResponse } from "../../api/types";
import { convertTripTimezoneToUtc } from "../../../utils/dateFormattors";

export const eventApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addEvent: builder.mutation<
      ApiResponse<Event>,
      { tripId: number; event: EventSchema; timezone: string }
    >({
      query: ({ tripId, event, timezone }) => {
        const body = {
          ...event,
          startAt: convertTripTimezoneToUtc(event.startAt, timezone),
          endAt: convertTripTimezoneToUtc(event.endAt, timezone),
        };

        return {
          url: `/itineraries/${tripId}/events`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: (_, __, { tripId }) => [
        { type: "Trips", id: "LIST" },
        { type: "Trips", id: tripId },
      ],
    }),

    updateEvent: builder.mutation<
      ApiResponse<Event>,
      {
        tripId: number;
        eventId: number;
        updatedEvent: Partial<Event>;
        timezone: string;
      }
    >({
      query: ({ tripId, eventId, updatedEvent, timezone }) => {
        const body: Partial<Event> = { ...updatedEvent };
        if (body.startAt) {
          body.startAt = convertTripTimezoneToUtc(body.startAt, timezone);
        }
        if (body.endAt) {
          body.endAt = convertTripTimezoneToUtc(body.endAt, timezone);
        }

        return {
          url: `/itineraries/${tripId}/events/${eventId}`,
          method: "PATCH",
          body,
        };
      },
      invalidatesTags: (_, __, { tripId }) => [
        { type: "Trips", id: "LIST" },
        { type: "Trips", id: tripId },
      ],
    }),

    deleteEvent: builder.mutation<
      ApiResponse<{ deletedId: number }>,
      { tripId: number; eventId: number }
    >({
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
