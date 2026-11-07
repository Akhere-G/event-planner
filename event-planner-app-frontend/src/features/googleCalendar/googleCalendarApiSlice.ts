import { apiSlice } from "../api/apiSlice";
import type { ApiResponse } from "../api/types";
import type {
  AuthorisationLink,
  CalendarStatus,
  TripSyncPayload,
} from "./types";

const BASE = "/calendar/google";

export const googleCalendarApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCalendarStatus: builder.query<ApiResponse<CalendarStatus>, void>({
      query: () => `${BASE}/status`,
      providesTags: ["CalendarSync"],
    }),
    startCalendarConnect: builder.mutation<
      ApiResponse<AuthorisationLink>,
      void
    >({
      query: () => ({ url: `${BASE}/connect`, method: "POST" }),
    }),
    disconnectCalendar: builder.mutation<ApiResponse<null>, void>({
      query: () => ({ url: `${BASE}/connection`, method: "DELETE" }),
      invalidatesTags: ["CalendarSync"],
    }),
    enableTripSync: builder.mutation<ApiResponse<null>, TripSyncPayload>({
      query: ({ tripId }) => ({
        url: `${BASE}/trips/${tripId}`,
        method: "PUT",
      }),
      invalidatesTags: ["CalendarSync"],
    }),
    disableTripSync: builder.mutation<ApiResponse<null>, TripSyncPayload>({
      query: ({ tripId }) => ({
        url: `${BASE}/trips/${tripId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CalendarSync"],
    }),
  }),
});

export const {
  useGetCalendarStatusQuery,
  useStartCalendarConnectMutation,
  useDisconnectCalendarMutation,
  useEnableTripSyncMutation,
  useDisableTripSyncMutation,
} = googleCalendarApiSlice;
