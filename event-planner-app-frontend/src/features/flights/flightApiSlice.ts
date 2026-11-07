import { apiSlice } from "../api/apiSlice";
import type { ApiResponse } from "../api/types";
import type {
  AirportPlace,
  CreateFlightPayload,
  DeleteFlightPayload,
  Flight,
  FlightOffer,
  SearchAirportsPayload,
  SearchFlightsPayload,
} from "./types";

export const flightApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFlights: builder.query<ApiResponse<Flight[]>, number>({
      query: (tripId) => `/itineraries/${tripId}/flights`,
      providesTags: (_result, _error, tripId) => [
        { type: "Flights", id: tripId },
      ],
    }),
    searchFlights: builder.query<
      ApiResponse<FlightOffer[]>,
      SearchFlightsPayload
    >({
      query: ({ tripId, origin, destination, departureDate }) => ({
        url: `/itineraries/${tripId}/flights/search`,
        params: {
          origin: origin.join(","),
          destination: destination.join(","),
          departureDate,
        },
      }),
    }),
    searchAirports: builder.query<
      ApiResponse<AirportPlace[]>,
      SearchAirportsPayload
    >({
      query: ({ tripId, ...params }) => ({
        url: `/itineraries/${tripId}/flights/airports`,
        params,
      }),
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
  useLazySearchFlightsQuery,
  useSearchAirportsQuery,
  useCreateFlightMutation,
  useDeleteFlightMutation,
} = flightApiSlice;
