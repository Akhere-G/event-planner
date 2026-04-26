import type { User } from "../types";
import UserRow from "./UserRow";

export default function UsersTable({ users }: { users: User[] }) {
  return (
    <div className="rounded-md border bg-surface shadow-sm overflow-x-scroll">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b bg-surface-muted/50">
            <th className="px-2 pl-4 py-2 md:px-6 md:py-2 text-sm text-text-secondary">
              Username
            </th>
            <th className="px-2 py-2 md:px-6 md:py-2 text-sm text-text-secondary">
              Email Address
            </th>
            <th className="px-2 py-2 md:px-6 md:py-2 text-sm text-text-secondary text-center">
              Role
            </th>
            <th className="px-2 py-2 md:px-6 md:py-2 text-sm text-text-secondary text-center"></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => <UserRow key={user.id} user={user} />)
          ) : (
            <tr>
              <td
                colSpan={3}
                className="px-6 py-10 text-center text-text-muted"
              >
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
