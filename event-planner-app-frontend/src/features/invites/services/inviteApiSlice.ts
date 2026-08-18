import { apiSlice } from "../../api/apiSlice";
import type { ApiResponse } from "../../api/types";
import type { InviteSchema } from "../schemas/inviteSchema";
import { type Invite } from "../types";

export const inviteApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInvites: builder.query<ApiResponse<{ invites: Invite[] }>, number>({
      query: (tripId) => `/itineraries/${tripId}/invites`,
      providesTags: (result) => {
        const value = result
          ? result.data.invites.map(
              (invite) => ({ type: "Invites", id: invite.id }) as const,
            )
          : [];

        return [{ type: "Invites", id: "LIST" } as const, ...value];
      },
    }),
    createInvite: builder.mutation<
      ApiResponse<Invite>,
      { tripId: number; invite: InviteSchema }
    >({
      query: ({ tripId, invite }) => ({
        url: `/itineraries/${tripId}/invites`,
        method: "POST",
        body: invite,
      }),
      invalidatesTags: (result, _, args) => [
        { type: "Invites", id: "LIST" },
        { type: "Trips", id: "LIST" },
        { type: "Invites", id: result?.data?.id },
        { type: "Trips", id: args.tripId },
      ],
    }),
    revokeInvite: builder.mutation<
      ApiResponse<Invite>,
      { tripId: number; inviteId: number }
    >({
      query: ({ tripId, inviteId }) => ({
        url: `/itineraries/${tripId}/invites/${inviteId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, _, args) => [
        { type: "Invites", id: "LIST" },
        { type: "Trips", id: "LIST" },
        { type: "Invites", id: result?.data?.id },
        { type: "Trips", id: args.tripId },
      ],
    }),
    joinTrip: builder.mutation<ApiResponse<Invite>, { token: string }>({
      query: ({ token }) => ({
        url: `/invites/join/${token}`,
        method: "POST",
      }),
      invalidatesTags: (result) => [
        { type: "Invites", id: "LIST" },
        { type: "Trips", id: "LIST" },
        { type: "Invites", id: result?.data?.id },
      ],
    }),
    getMyInvites: builder.query<ApiResponse<{ invites: Invite[] }>, void>({
      query: () => `/invites`,
      providesTags: (result) => {
        const value = result
          ? result.data.invites.map(
              (invite) => ({ type: "Invites", id: invite.id }) as const,
            )
          : [];

        return [{ type: "Invites", id: "LIST" } as const, ...value];
      },
    }),
    acceptInvite: builder.mutation<
      ApiResponse<Invite>,
      { token: string; inviteId: number }
    >({
      query: ({ token }) => ({
        url: `/invites/${token}/accept`,
        method: "POST",
      }),
      invalidatesTags: (_, __, args) => [
        { type: "Invites", id: "LIST" },
        { type: "Trips", id: "LIST" },
        { type: "Invites", id: args.inviteId },
      ],
    }),
    declineInvite: builder.mutation<
      ApiResponse<Invite>,
      { token: string; inviteId: number }
    >({
      query: ({ token }) => ({
        url: `/invites/${token}/decline`,
        method: "POST",
      }),
      invalidatesTags: (_, __, args) => [
        { type: "Invites", id: "LIST" },
        { type: "Trips", id: "LIST" },
        { type: "Invites", id: args.inviteId },
      ],
    }),
  }),
});

export const {
  useGetInvitesQuery,
  useCreateInviteMutation,
  useRevokeInviteMutation,
  useGetMyInvitesQuery,
  useAcceptInviteMutation,
  useDeclineInviteMutation,
  useJoinTripMutation,
} = inviteApi;
