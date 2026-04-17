import type { User } from "../types";
import UserAvatar from "./UserAvatar";

export default function UserAvatarList({ users }: { users: User[] }) {
  return (
    <div className="flex pr-2">
      {users.map((user) => (
        <div key={user.id} className="-mr-2">
          <UserAvatar {...user} />
        </div>
      ))}
    </div>
  );
}
