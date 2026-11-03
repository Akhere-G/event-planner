import { apiSlice } from "../api/apiSlice";
import type { ApiResponse } from "../api/types";
import type {
  CreateFlightPayload,
  DeleteFlightPayload,
  Flight,
  UpdateFlightPayload,
} from "./types";

export const flightApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFlights: builder.query<ApiResponse<Flight[]>, number>({
      query: (tripId) => `/itineraries/${tripId}/flights`,
      providesTags: (_result, _error, tripId) => [
        { type: "Flights", id: tripId },
      ],
    }),
    createFlight: builder.mutation<ApiResponse<Flight>, CreateFlightPayload>({
      query: ({ tripId, ...flightData }) => ({
        url: `/itineraries/${tripId}/flights`,
        method: "POST",
        body: flightData,
      }),
      invalidatesTags: (_result, _error, { tripId }) => [
        { type: "Flights", id: tripId },
      ],
    }),
    updateFlight: builder.mutation<ApiResponse<Flight>, UpdateFlightPayload>({
      query: ({ tripId, flightId, ...flightData }) => ({
        url: `/itineraries/${tripId}/flights/${flightId}`,
        method: "PATCH",
        body: flightData,
      }),
      invalidatesTags: (_result, _error, { tripId }) => [
        { type: "Flights", id: tripId },
      ],
    }),
    deleteFlight: builder.mutation<
      ApiResponse<{ deletedId: number }>,
      DeleteFlightPayload
    >({
      query: ({ tripId, flightId }) => ({
        url: `/itineraries/${tripId}/flights/${flightId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { tripId }) => [
        { type: "Flights", id: tripId },
      ],
    }),
  }),
});

export const {
  useGetFlightsQuery,
  useLazyGetFlightsQuery,
  useCreateFlightMutation,
  useUpdateFlightMutation,
  useDeleteFlightMutation,
} = flightApiSlice;
