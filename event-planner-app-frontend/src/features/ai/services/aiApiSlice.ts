import { apiSlice } from "../../api/apiSlice";
import type { ApiResponse } from "../../api/types";
import type { AutofillConfig } from "../../events/types";
import type { TripInsight } from "../types";

export const aiApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTripInsights: builder.query<
      ApiResponse<TripInsight[]>,
      { tripId: number }
    >({
      query: ({ tripId }) => `/ai/insights/${tripId}`,
    }),
    suggestEvents: builder.mutation<
      ApiResponse<Event[]>,
      { tripId: number; body: AutofillConfig }
    >({
      query: ({ tripId, body }) => ({
        url: `/ai/suggest-events/${tripId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_, __, args) => [
        { type: "Trips", id: "LIST" },
        { type: "Trips", id: args.tripId },
      ],
    }),
    optimiseEvents: builder.mutation<
      ApiResponse<Event[]>,
      { tripId: number; date: string }
    >({
      query: ({ tripId, date }) => ({
        url: `/ai/optimise-events/${tripId}`,
        method: "POST",
        body: { date },
      }),
      invalidatesTags: (_, __, args) => [
        { type: "Trips", id: "LIST" },
        { type: "Trips", id: args.tripId },
      ],
    }),
  }),
});
export const {
  useGetTripInsightsQuery,
  useLazyGetTripInsightsQuery,
  useSuggestEventsMutation,
  useOptimiseEventsMutation,
} = aiApiSlice;
