import { apiSlice } from "../../api/apiSlice";
import { type Invite } from "../types";

export const inviteApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInvites: builder.query<{ data: { invites: Invite[] } }, number>({
      query: (tripId) => `/itineraries/${tripId}/invites`,
      providesTags: (result) => [
        { type: "Invites", id: "List" } as const,
        ...result.data.invites.map(
          (invite) => ({ type: "Invites", id: invite.id }) as const,
        ),
      ],
    }),
  }),
});

export const { useGetInvitesQuery } = inviteApi;
