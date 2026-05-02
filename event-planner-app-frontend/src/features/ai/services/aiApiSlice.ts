import { apiSlice } from "../../api/apiSlice";
import type { TripInsight } from "../types";

export const aiApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTripInsights: builder.query<{ data: TripInsight[] }, { tripId: number }>(
      {
        query: ({ tripId }) => `/ai/insights/${tripId}`,
      },
    ),
  }),
});

export const { useGetTripInsightsQuery } = aiApiSlice;
