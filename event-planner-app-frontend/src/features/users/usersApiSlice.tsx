import { apiSlice } from "../api/apiSlice";
import type { ApiResponse } from "../api/types";
import type { User } from "./types";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<ApiResponse<{ users: User[] }>, number>({
      query: (tripId) => `/itineraries/${tripId}/users`,
      providesTags: (result, __, tripId) => {
        const userTags = result
          ? result.data.users.map(
              (user) => ({ type: "Users", id: user.id }) as const,
            )
          : [];

        return [
          { type: "Trips", id: tripId },
          { type: "Trips", id: "LIST" },
          { type: "Users", id: "LIST" },
          ...userTags,
        ];
      },
    }),
    removeUser: builder.mutation<
      ApiResponse<{ removedUserId: number }>,
      { tripId: number; userId: number }
    >({
      query: ({ tripId, userId }) => ({
        url: `/itineraries/${tripId}/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, { tripId, userId }) => [
        { type: "Trips", id: "LIST" },
        { type: "Trips", id: tripId },
        { type: "Users", id: "LIST" },
        { type: "Users", id: userId },
      ],
    }),
    updateUser: builder.mutation<
      ApiResponse<User>,
      { tripId: number; userId: number; newUserData: Partial<User> }
    >({
      query: ({ tripId, userId, newUserData }) => ({
        url: `/itineraries/${tripId}/users/${userId}`,
        method: "PATCH",
        body: newUserData,
      }),
      invalidatesTags: (_, __, { tripId, userId }) => [
        { type: "Trips", id: "LIST" },
        { type: "Trips", id: tripId },
        { type: "Users", id: "LIST" },
        { type: "Users", id: userId },
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useRemoveUserMutation,
  useUpdateUserMutation,
} = userApiSlice;
