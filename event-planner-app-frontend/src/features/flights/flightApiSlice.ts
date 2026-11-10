import { apiSlice } from "../api/apiSlice";
import type { ApiResponse } from "../api/types";
import type {
  AirportPlace,
  CreateFlightPayload,
  CreateFlightsByNumberPayload,
  DeleteFlightPayload,
  Flight,
  FlightJourney,
  SearchAirportsPayload,
  SearchByFlightNumberPayload,
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
      ApiResponse<FlightJourney[]>,
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
    searchByFlightNumber: builder.query<
      ApiResponse<FlightJourney[]>,
      SearchByFlightNumberPayload
    >({
      query: ({ tripId, flightCode, departureDate }) => ({
        url: `/itineraries/${tripId}/flights/by-number`,
        params: { flightCode, departureDate },
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
    createFlight: builder.mutation<ApiResponse<Flight[]>, CreateFlightPayload>({
      query: ({ tripId, ...flightData }) => ({
        url: `/itineraries/${tripId}/flights`,
        method: "POST",
        body: flightData,
      }),
      // A new journey gets an expense, and deleting a flight unlinks its expense.
      invalidatesTags: (_result, _error, { tripId }) => [
        { type: "Flights", id: tripId },
        { type: "Expenses", id: tripId },
      ],
    }),
    createFlightsByNumber: builder.mutation<
      ApiResponse<Flight[]>,
      CreateFlightsByNumberPayload
    >({
      query: ({ tripId, ...flightData }) => ({
        url: `/itineraries/${tripId}/flights/by-number`,
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
      // A new flight gets an expense, and deleting one unlinks its expense.
      invalidatesTags: (_result, _error, { tripId }) => [
        { type: "Flights", id: tripId },
        { type: "Expenses", id: tripId },
      ],
    }),
  }),
});

export const {
  useGetFlightsQuery,
  useLazyGetFlightsQuery,
  useLazySearchFlightsQuery,
  useLazySearchByFlightNumberQuery,
  useSearchAirportsQuery,
  useCreateFlightMutation,
  useCreateFlightsByNumberMutation,
  useDeleteFlightMutation,
} = flightApiSlice;
