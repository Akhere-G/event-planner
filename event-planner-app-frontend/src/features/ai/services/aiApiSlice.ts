import { apiSlice } from "../../api/apiSlice";
import type { ApiResponse } from "../../api/types";
import type { TripInsight } from "../types";

export const aiApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTripInsights: builder.query<
      ApiResponse<TripInsight[]>,
      { tripId: number }
    >({
      query: ({ tripId }) => `/ai/insights/${tripId}`,
    }),
  }),
});
export const { useGetTripInsightsQuery, useLazyGetTripInsightsQuery } =
  aiApiSlice;
