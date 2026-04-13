import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Trip } from "./types";

const baseUrl = import.meta.env.VITE_API_URL;

export const tripsApi = createApi({
  reducerPath: "trips",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getTrips: builder.query<Trip[], void>({
      query: () => "/itineraries",
    }),
  }),
});

export const { useGetTripsQuery } = tripsApi;
