import type { Invite } from "../types";
import InviteRow from "./InviteRow";

export default function Invites({ invites }: { invites: Invite[] }) {
  return (
    <div className="rounded-md border  bg-surface shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b bg-surface-muted/50">
            <th className="px-6 py-4 text-sm text-text-secondary">
              Email Address
            </th>
            <th className="px-6 py-4 text-sm text-text-secondary text-center">
              Role
            </th>
            <th className="px-6 py-4 text-sm text-text-secondary text-center">
              Status
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {invites.length > 0 ? (
            invites.map((invite) => (
              <InviteRow key={invite.id} invite={invite} />
            ))
          ) : (
            <tr>
              <td
                colSpan={3}
                className="px-6 py-10 text-center text-text-muted"
              >
                No pending invitations found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
