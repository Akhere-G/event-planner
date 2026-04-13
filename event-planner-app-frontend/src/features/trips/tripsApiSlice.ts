import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Trip } from "./types";

const baseUrl = import.meta.env.VITE_API_URL;

export interface GetTripsResult {
  data: { itineraries: Trip[] };
}
export const tripsApi = createApi({
  reducerPath: "trips",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getTrips: builder.query<GetTripsResult, void>({
      query: () => "/itineraries",
    }),
  }),
});

export const { useGetTripsQuery } = tripsApi;
