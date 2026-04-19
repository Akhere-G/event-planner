import { useMatch } from "react-router";
import { useGetInvitesQuery } from "../services/inviteApiSlice";
import { ErrorState, LoadingState } from "../../../components";
import InviteUserForm from "./InviteUserForm";
import Invites from "./Invites";

export default function InvitesView() {
  const { params } = useMatch("/trips/:tripId");

  const { data, isLoading, isError } = useGetInvitesQuery(
    Number(params.tripId),
  );

  let mainContent = <></>;

  if (isLoading) {
    mainContent = <LoadingState />;
  } else if (isError) {
    mainContent = <ErrorState />;
  } else {
    mainContent = <Invites invites={data?.data.invites ?? []} />;
  }

  return (
    <div>
      {mainContent}
      {!isError && !isLoading && (
        <div>
          <h2 className="title mt-4 mb-2">Invite user</h2>
          <InviteUserForm />
        </div>
      )}
    </div>
  );
}
