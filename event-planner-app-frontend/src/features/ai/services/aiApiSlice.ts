import { apiSlice } from "../../api/apiSlice";
import type { ApiResponse } from "../../api/types";
import type {
  ChatHistoryMessage,
  EditTripResult,
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
    proposeTripEdit: builder.mutation<
      ApiResponse<EditTripResult>,
      { tripId: number; message: string; history: ChatHistoryMessage[] }
    >({
      query: ({ tripId, message, history }) => ({
        url: `/ai/edit-trip/${tripId}`,
        method: "POST",
        body: { message, history },
      }),
    }),
  }),
});
export const {
  useGetTripInsightsQuery,
  useLazyGetTripInsightsQuery,
  useProposeTripEditMutation,
} = aiApiSlice;
