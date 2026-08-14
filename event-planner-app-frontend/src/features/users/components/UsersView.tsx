import { Link, useMatch } from "react-router";
import { useGetUsersQuery } from "../usersApiSlice";
import { StateGate } from "../../../components";
import UsersTable from "./UsersTable";

export default function UsersView() {
  const params = useMatch("/trips/:tripId")?.params;
  const tripId = Number(params?.tripId);

  const { data, isLoading, isError } = useGetUsersQuery(tripId);

  return (
    <StateGate loadingStateProps={{ isLoading }} errorStateProps={{ isError }}>
      <div className="flex flex-col gap-4 items-start ">
        <div className="w-full">
          <UsersTable users={data?.data.users ?? []} />
        </div>
        {!isError && !isLoading && (
          <Link
            to={`/trips/${tripId}?view=invites`}
            className="btn-primary px-4 py-2 rounded-md"
          >
            Invite User
          </Link>
        )}
      </div>
    </StateGate>
  );
}
