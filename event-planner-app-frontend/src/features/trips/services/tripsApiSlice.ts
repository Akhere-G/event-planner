import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Trip } from "../types";
import { type TripSchema } from "../schemas/tripSchema";

const baseUrl = import.meta.env.VITE_API_URL;

export interface GetTripsResult {
  data: { itineraries: Trip[]; hasMore: boolean };
}
export const tripsApi = createApi({
  tagTypes: ["Trips"],
  reducerPath: "trips",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",
  }),
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
    }),
    addTrip: builder.mutation<Trip, TripSchema>({
      query: (newTrip) => ({
        url: "/itineraries",
        body: newTrip,
        method: "POST",
      }),
      invalidatesTags: [{ type: "Trips", id: "LIST" }],
    }),
  }),
});

export const { useGetTripsQuery, useGetTripQuery, useAddTripMutation } =
  tripsApi;
