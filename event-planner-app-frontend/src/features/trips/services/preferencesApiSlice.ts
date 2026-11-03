import { apiSlice } from "../../api/apiSlice";
import type { ApiResponse } from "../../api/types";
import type { TripPreferences } from "../types";
import type { PreferencesInput } from "../schemas/preferencesSchema";

export const preferencesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPreferences: builder.query<ApiResponse<TripPreferences | null>, number>({
      query: (tripId) => `/itineraries/${tripId}/preferences`,
      providesTags: (_, __, tripId) => [{ type: "Preferences", id: tripId }],
    }),
    savePreferences: builder.mutation<
      ApiResponse<TripPreferences>,
      { tripId: number; preferences: Partial<PreferencesInput> }
    >({
      query: ({ tripId, preferences }) => ({
        url: `/itineraries/${tripId}/preferences`,
        method: "PUT",
        body: preferences,
      }),
      invalidatesTags: (_, __, { tripId }) => [
        { type: "Preferences", id: tripId },
      ],
    }),
  }),
});

export const { useGetPreferencesQuery, useSavePreferencesMutation } =
  preferencesApi;
