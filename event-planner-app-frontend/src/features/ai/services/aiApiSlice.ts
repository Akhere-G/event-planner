import { apiSlice } from "../../api/apiSlice";
import type { ApiResponse } from "../../api/types";
import type { AutofillConfig } from "../../events/types";
import type {
  ApplyChangeSetResult,
  ChangeOp,
  ChangePreview,
  TripInsight,
} from "../types";

export const aiApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTripInsights: builder.query<
      ApiResponse<TripInsight[]>,
      { tripId: number }
    >({
      query: ({ tripId }) => `/ai/insights/${tripId}`,
    }),
    previewEventSuggestions: builder.mutation<
      ApiResponse<ChangePreview>,
      { tripId: number; body: AutofillConfig & { date: string } }
    >({
      query: ({ tripId, body }) => ({
        url: `/ai/suggest-events/${tripId}/preview`,
        method: "POST",
        body,
      }),
    }),
    previewOptimisedEvents: builder.mutation<
      ApiResponse<ChangePreview>,
      { tripId: number; date: string }
    >({
      query: ({ tripId, date }) => ({
        url: `/ai/optimise-events/${tripId}/preview`,
        method: "POST",
        body: { date },
      }),
    }),
    previewCostEstimates: builder.mutation<
      ApiResponse<ChangePreview>,
      { tripId: number }
    >({
      query: ({ tripId }) => ({
        url: `/ai/estimate-costs/${tripId}/preview`,
        method: "POST",
      }),
    }),
    applyChangeSet: builder.mutation<
      ApiResponse<ApplyChangeSetResult>,
      { tripId: number; ops: ChangeOp[] }
    >({
      query: ({ tripId, ops }) => ({
        url: `/itineraries/${tripId}/changes/apply`,
        method: "POST",
        body: { ops },
      }),
      invalidatesTags: (_, __, args) => [
        { type: "Trips", id: "LIST" },
        { type: "Trips", id: args.tripId },
        "Accommodations",
        "Wishlists",
        { type: "PackingItem", id: "LIST" },
      ],
    }),
  }),
});
export const {
  useGetTripInsightsQuery,
  useLazyGetTripInsightsQuery,
  usePreviewEventSuggestionsMutation,
  usePreviewOptimisedEventsMutation,
  usePreviewCostEstimatesMutation,
  useApplyChangeSetMutation,
} = aiApiSlice;
