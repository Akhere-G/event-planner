import type { Event } from "../types";
import type { EventSchema } from "../schemas/eventSchema";
import { apiSlice } from "../../api/apiSlice";
import type { ApiResponse } from "../../api/types";
import {
  convertTripTimezoneToUtc,
  convertUtcToTripTimezone,
} from "../../../utils/dateFormattors";

const invalidateTripEvents = (
  _: unknown,
  __: unknown,
  { tripId }: { tripId: number },
) => [
  { type: "Trips" as const, id: "LIST" as const },
  { type: "Events" as const, id: tripId },
];

export const eventApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query<
      ApiResponse<{ events: Event[] }>,
      { tripId: number; timezone: string }
    >({
      query: ({ tripId }) => `/itineraries/${tripId}/events`,
      transformResponse: (
        response: ApiResponse<{ events: Event[] }>,
        _meta,
        { timezone },
      ) => ({
        ...response,
        data: {
          ...response.data,
          events: response.data.events.map((event) => ({
            ...event,
            startAt: convertUtcToTripTimezone(event.startAt, timezone),
            endAt: convertUtcToTripTimezone(event.endAt, timezone),
          })),
        },
      }),
      providesTags: (_result, _error, { tripId }) => [
        { type: "Events", id: tripId },
      ],
    }),

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
      invalidatesTags: invalidateTripEvents,
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
      invalidatesTags: invalidateTripEvents,
    }),

    deleteEvent: builder.mutation<
      ApiResponse<{ deletedId: number }>,
      { tripId: number; eventId: number }
    >({
      query: ({ tripId, eventId }) => ({
        url: `/itineraries/${tripId}/events/${eventId}`,
        method: "DELETE",
      }),
      invalidatesTags: invalidateTripEvents,
    }),
  }),
});

export const {
  useGetEventsQuery,
  useAddEventMutation,
  useDeleteEventMutation,
  useUpdateEventMutation,
} = eventApi;
