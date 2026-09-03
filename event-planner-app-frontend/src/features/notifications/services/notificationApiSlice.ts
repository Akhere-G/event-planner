import { apiSlice } from "../../api/apiSlice";
import type {
  NotificationCreate,
  NotificationItem,
  NotificationsResponse,
  VapidKeyResponse,
} from "../types";

export const notificationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getVapidPublicKey: builder.query<VapidKeyResponse, void>({
      query: () => "/notifications/vapid-public-key",
      transformResponse: (response: { data: VapidKeyResponse }) => response.data,
    }),
    subscribeToPush: builder.mutation<void, NotificationCreate>({
      query: (body) => ({
        url: "/notifications/subscribe",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notifications"],
    }),
    unsubscribeFromPush: builder.mutation<void, { endpoint?: string }>({
      query: (body) => ({
        url: "/notifications/unsubscribe",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notifications"],
    }),
    getNotifications: builder.query<NotificationsResponse, void>({
      query: () => "/notifications",
      transformResponse: (response: { data: NotificationsResponse }) => response.data,
      providesTags: ["Notifications"],
    }),
    markNotificationAsRead: builder.mutation<NotificationItem, number>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),
    markAllNotificationsAsRead: builder.mutation<void, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useGetVapidPublicKeyQuery,
  useSubscribeToPushMutation,
  useUnsubscribeFromPushMutation,
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} = notificationApiSlice;
