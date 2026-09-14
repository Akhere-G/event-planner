import type { Trip } from "../types";
import { type TripSchema } from "../schemas/tripSchema";
import { apiSlice } from "../../api/apiSlice";
import type { ApiResponse } from "../../api/types";
import { convertUtcToTripTimezone } from "../../../utils/dateFormattors";

export interface GetTripsResult {
  data: { itineraries: Trip[]; hasMore: boolean };
}
export const tripsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTrips: builder.query<GetTripsResult, { limit: number; offset: number }>({
      query: ({ limit, offset }) => ({
        url: `/itineraries?limit=${limit}&offset=${offset}`,
        method: "GET",
      }),
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, newItems, { arg }) => {
        if (arg.offset === 0) {
          currentCache.data.itineraries = newItems.data.itineraries;
        } else {
          currentCache.data.itineraries.push(...newItems.data.itineraries);
        }
        currentCache.data.hasMore = newItems.data.hasMore;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.itineraries.map(
                ({ id }) => ({ type: "Trips", id }) as const,
              ),
              { type: "Trips", id: "LIST" },
            ]
          : [{ type: "Trips", id: "LIST" }],

      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.offset !== previousArg?.offset;
      },
    }),

    getTrip: builder.query<ApiResponse<Trip>, number>({
      query: (id) => `/itineraries/${id}`,
      transformResponse: (response: ApiResponse<Trip>) => {
        if (!response.data || !response.data.events || !response.data.timezone)
          return response;
        const timezone = response.data.timezone;

        const transformedEvents = response.data.events.map((event) => ({
          ...event,
          startAt: convertUtcToTripTimezone(event.startAt, timezone),
          endAt: convertUtcToTripTimezone(event.endAt, timezone),
        }));

        return {
          ...response,
          data: {
            ...response.data,
            events: transformedEvents,
          },
        };
      },
      providesTags: (result) => [{ type: "Trips", id: result?.data?.id }],
    }),
    addTrip: builder.mutation<ApiResponse<Trip>, TripSchema>({
      query: (newTrip) => ({
        url: "/itineraries",
        body: newTrip,
        method: "POST",
      }),

      invalidatesTags: [{ type: "Trips", id: "LIST" }],
    }),
    editTrip: builder.mutation<
      ApiResponse<Trip>,
      { tripId: number; updatedTrip: Partial<TripSchema> }
    >({
      query: ({ updatedTrip, tripId }) => ({
        url: `/itineraries/${tripId}`,
        body: updatedTrip,
        method: "PATCH",
      }),
      invalidatesTags: (_, __, { tripId }) => [
        { type: "Trips", id: "LIST" },
        { type: "Trips", id: tripId },
      ],
    }),
    deleteTrip: builder.mutation<ApiResponse<{ deletedId: number }>, number>({
      query: (id) => ({
        url: `/itineraries/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, tripId) => [
        { type: "Trips", id: "LIST" },
        { type: "Trips", id: tripId },
      ],
    }),
    saveTrip: builder.mutation<ApiResponse<Trip>, number>({
      query: (id) => ({
        url: `/itineraries/${id}/save`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useGetTripsQuery,
  useGetTripQuery,
  useAddTripMutation,
  useEditTripMutation,
  useDeleteTripMutation,
  useSaveTripMutation,
} = tripsApi;
