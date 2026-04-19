import { useMatch } from "react-router";
import { useGetInvitesQuery } from "../services/inviteApiSlice";
import { StateGate } from "../../../components";
import InviteUserForm from "./InviteUserForm";
import Invites from "./Invites";

export default function InvitesView() {
  const { params } = useMatch("/trips/:tripId");

  const { data, isLoading, isError } = useGetInvitesQuery(
    Number(params.tripId),
  );

  return (
    <div>
      <StateGate
        loadingStateProps={{ isLoading }}
        errorStateProps={{ isError }}
      >
        <Invites invites={data?.data.invites ?? []} />
      </StateGate>
      {!isError && !isLoading && (
        <div>
          <h2 className="title mt-4 mb-2">Invite user</h2>
          <InviteUserForm />
        </div>
      )}
    </div>
  );
}
