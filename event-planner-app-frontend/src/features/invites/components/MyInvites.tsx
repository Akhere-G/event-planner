import type { Invite } from "../types";
import MyInviteCard from "./MyInviteCard";

function MyInvites({ invites }: { invites: Invite[] }) {
  console.log(invites);
  return (
    <div>
      {invites.map((invite) => (
        <MyInviteCard key={invite.id} invite={invite} />
      ))}
    </div>
  );
}

export default MyInvites;
