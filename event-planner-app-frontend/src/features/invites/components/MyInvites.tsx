import type { Invite } from "../types";

function MyInvites({ invites }: { invites: Invite[] }) {
  console.log(invites);
  return <div>MyInvites</div>;
}

export default MyInvites;
