import { apiSlice } from "../../api/apiSlice";
import type { InviteSchema } from "../schemas/inviteSchema";
import { type Invite } from "../types";

export const inviteApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInvites: builder.query<{ data: { invites: Invite[] } }, number>({
      query: (tripId) => `/itineraries/${tripId}/invites`,
      providesTags: (result) => [
        { type: "Invites", id: "LIST" } as const,
        ...result.data.invites.map(
          (invite) => ({ type: "Invites", id: invite.id }) as const,
        ),
      ],
    }),
    createInvite: builder.mutation<
      { data: Invite },
      { tripId: number; invite: InviteSchema }
    >({
      query: ({ tripId, invite }) => ({
        url: `itineraries/${tripId}/invites`,
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
      { data: Invite },
      { tripId: number; inviteId: number }
    >({
      query: ({ tripId, inviteId }) => ({
        url: `itineraries/${tripId}/invites/${inviteId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, _, args) => [
        { type: "Invites", id: "LIST" },
        { type: "Trips", id: "LIST" },
        { type: "Invites", id: result?.data?.id },
        { type: "Trips", id: args.tripId },
      ],
    }),
    getMyInvites: builder.query<{ data: { invites: Invite[] } }, void>({
      query: () => `/invites`,
      providesTags: (result) => [
        { type: "Invites", id: "LIST" } as const,
        ...result.data.invites.map(
          (invite) => ({ type: "Invites", id: invite.id }) as const,
        ),
      ],
    }),
    acceptInvite: builder.mutation<
      { data: Invite },
      { token: string; inviteId: number }
    >({
      query: ({ token }) => ({
        url: `/invites/${token}/accept`,
        method: "POST",
      }),
      invalidatesTags: (_, __, args) => [
        { type: "Invites", id: "LIST" },
        { type: "Invites", id: args.inviteId },
      ],
    }),
    declineInvite: builder.mutation<
      { data: Invite },
      { token: string; inviteId: number }
    >({
      query: ({ token }) => ({
        url: `/invites/${token}/decline`,
        method: "POST",
      }),
      invalidatesTags: (_, __, args) => [
        { type: "Invites", id: "LIST" },
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
} = inviteApi;
