import { apiSlice } from "../api/apiSlice";
import type { ApiResponse } from "../api/types";
import type {
  Accommodation,
  CreateAccommodationPayload,
  UpdateAccommodationPayload,
  DeleteAccommodationPayload,
} from "./types";

export const accommodationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAccommodations: builder.query<ApiResponse<Accommodation[]>, number>({
      query: (tripId) => `/itineraries/${tripId}/accommodations`,
      providesTags: ["Accommodations"],
    }),
    createAccommodation: builder.mutation<
      ApiResponse<Accommodation>,
      CreateAccommodationPayload
    >({
      query: ({ tripId, ...accommodationData }) => ({
        url: `/itineraries/${tripId}/accommodations`,
        method: "POST",
        body: accommodationData,
      }),
      invalidatesTags: ["Accommodations"],
    }),
    updateAccommodation: builder.mutation<
      ApiResponse<Accommodation>,
      UpdateAccommodationPayload
    >({
      query: ({ tripId, accommodationId, ...accommodationData }) => ({
        url: `/itineraries/${tripId}/accommodations/${accommodationId}`,
        method: "PATCH",
        body: accommodationData,
      }),
      invalidatesTags: ["Accommodations"],
    }),
    deleteAccommodation: builder.mutation<
      ApiResponse<{ deletedId: number }>,
      DeleteAccommodationPayload
    >({
      query: ({ tripId, accommodationId }) => ({
        url: `/itineraries/${tripId}/accommodations/${accommodationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Accommodations"],
    }),
  }),
});

export const {
  useGetAccommodationsQuery,
  useCreateAccommodationMutation,
  useUpdateAccommodationMutation,
  useDeleteAccommodationMutation,
} = accommodationApiSlice;
