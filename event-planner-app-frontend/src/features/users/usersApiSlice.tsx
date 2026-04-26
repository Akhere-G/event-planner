import { apiSlice } from "../api/apiSlice";
import type { User } from "./types";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<{ data: { users: User[] } }, number>({
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
    removeUser: builder.mutation<void, { tripId: number; userId: number }>({
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
  }),
});

export const { useGetUsersQuery, useRemoveUserMutation } = userApiSlice;
