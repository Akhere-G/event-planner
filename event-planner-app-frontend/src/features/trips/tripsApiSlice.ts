import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Trip } from "./types";

const baseUrl = import.meta.env.VITE_API_URL;

export interface GetTripsResult {
  data: { itineraries: Trip[]; hasMore: boolean };
}
export const tripsApi = createApi({
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
      },

      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.offset !== previousArg?.offset;
      },
    }),
  }),
});

export const { useGetTripsQuery } = tripsApi;
