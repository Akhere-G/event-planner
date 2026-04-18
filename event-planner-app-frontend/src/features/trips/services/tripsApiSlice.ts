import type { Trip } from "../types";
import { type TripSchema } from "../schemas/tripSchema";
import { apiSlice } from "../../api/apiSlice";

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
    getTrip: builder.query<{ data: Trip }, number, { status: number }>({
      query: (id) => `itineraries/${id}`,
      providesTags: (result) => [{ type: "Trips", id: result.data.id }],
    }),
    addTrip: builder.mutation<Trip, TripSchema>({
      query: (newTrip) => ({
        url: "/itineraries",
        body: newTrip,
        method: "POST",
      }),

      invalidatesTags: [{ type: "Trips", id: "LIST" }],
    }),
    editTrip: builder.mutation<
      { data: Trip },
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
    deleteTrip: builder.mutation<void, number>({
      query: (id) => ({
        url: `/itineraries/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, tripId) => [
        { type: "Trips", id: "LIST" },
        { type: "Trips", id: tripId },
      ],
    }),
  }),
});

export const {
  useGetTripsQuery,
  useGetTripQuery,
  useAddTripMutation,
  useEditTripMutation,
  useDeleteTripMutation,
} = tripsApi;
