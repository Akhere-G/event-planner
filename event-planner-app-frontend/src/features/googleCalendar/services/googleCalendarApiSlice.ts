import { apiSlice } from "../../api/apiSlice";
import type { ApiResponse } from "../../api/types";
import type { AuthorisationLink, CalendarStatus } from "../types";

const syncTags = [{ type: "CalendarSync" as const }];

export const googleCalendarApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCalendarStatus: builder.query<ApiResponse<CalendarStatus>, void>({
      query: () => "/calendar/google/status",
      providesTags: syncTags,
    }),
    connectCalendar: builder.mutation<ApiResponse<AuthorisationLink>, void>({
      query: () => ({ url: "/calendar/google/connect", method: "POST" }),
    }),
    disconnectCalendar: builder.mutation<ApiResponse<null>, void>({
      query: () => ({ url: "/calendar/google/connection", method: "DELETE" }),
      invalidatesTags: syncTags,
    }),
    enableTripSync: builder.mutation<ApiResponse<null>, number>({
      query: (tripId) => ({
        url: `/calendar/google/trips/${tripId}`,
        method: "PUT",
      }),
      invalidatesTags: syncTags,
    }),
    disableTripSync: builder.mutation<ApiResponse<null>, number>({
      query: (tripId) => ({
        url: `/calendar/google/trips/${tripId}`,
        method: "DELETE",
      }),
      invalidatesTags: syncTags,
    }),
  }),
});

export const {
  useGetCalendarStatusQuery,
  useConnectCalendarMutation,
  useDisconnectCalendarMutation,
  useEnableTripSyncMutation,
  useDisableTripSyncMutation,
} = googleCalendarApiSlice;
