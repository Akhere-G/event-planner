import { StateGate } from "../components";
import MyInvites from "../features/invites/components/MyInvites";
import { useGetMyInvitesQuery } from "../features/invites/services/inviteApiSlice";

export default function InvitesPage() {
  const { data, isLoading, isError } = useGetMyInvitesQuery();

  return (
    <div className="container">
      <div className="card mb-6">
        <h2 className="title mb-4">Invites</h2>
      </div>
      <StateGate
        isLoading={isLoading}
        isError={isError}
        emptyStateProps={{
          isEmpty: !data?.data.invites.length,
          message: "No trips",
          height: 50,
        }}
        loadingText="Loading Invites"
        errorText="Could not get invites."
      >
        <MyInvites invites={data?.data.invites ?? []} />
      </StateGate>
    </div>
  );
}
