import { useMatch } from "react-router";
import { useGetInvitesQuery } from "../services/inviteApiSlice";
import { EmptyState, ErrorState, LoadingState } from "../../../components";
import InviteUserForm from "./InviteUserForm";

export default function InvitesView() {
  const { params } = useMatch("/trips/:tripId");

  const { data, isLoading, isError } = useGetInvitesQuery(
    Number(params.tripId),
  );

  let mainContent = <></>;

  if (isLoading) {
    mainContent = <LoadingState />;
  }
  if (isError) {
    mainContent = <ErrorState />;
  }
  if (!data || data.data.invites.length === 0) {
    mainContent = <EmptyState message="No invites" />;
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
