import { apiSlice } from "../../api/apiSlice";
import type { ApiResponse } from "../../api/types";
import type { Trip } from "../../trips/types";
import type {
  CreateFromDraftRequest,
  TripBuilderChatRequest,
  TripBuilderReply,
} from "../types";

export const tripBuilderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendBuilderMessage: builder.mutation<
      ApiResponse<TripBuilderReply>,
      TripBuilderChatRequest
    >({
      query: (body) => ({
        url: "/ai/trip-builder/chat",
        method: "POST",
        body,
      }),
    }),
    createTripFromDraft: builder.mutation<
      ApiResponse<Trip>,
      CreateFromDraftRequest
    >({
      query: (body) => ({
        url: "/itineraries/from-draft",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Trips", id: "LIST" }],
    }),
  }),
});

export const { useSendBuilderMessageMutation, useCreateTripFromDraftMutation } =
  tripBuilderApi;
