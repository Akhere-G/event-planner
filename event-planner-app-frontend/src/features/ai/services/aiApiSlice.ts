import { apiSlice } from "../../api/apiSlice";
import type { TripInsight } from "../types";

export const aiApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTripInsights: builder.query<{ data: TripInsight[] }, { tripId: number }>(
      {
        query: ({ tripId }) => `/ai/insights/${tripId}`,
      },
    ),
    suggestEvents: builder.mutation<
      { data: Event[] },
      { tripId: number; date: string }
    >({
      query: ({ tripId, date }) => ({
        url: `/ai/suggest-events/${tripId}`,
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

export const { useGetTripInsightsQuery, useSuggestEventsMutation } = aiApiSlice;
