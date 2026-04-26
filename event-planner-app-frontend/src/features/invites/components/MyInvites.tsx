import type { Invite } from "../types";
import MyInviteCard from "./MyInviteCard";

function MyInvites({ invites }: { invites: Invite[] }) {
  return (
    <div className="flex flex-col gap-4">
      {invites.map((invite) => (
        <MyInviteCard key={invite.id} invite={invite} />
      ))}
    </div>
  );
}

export default MyInvites;
