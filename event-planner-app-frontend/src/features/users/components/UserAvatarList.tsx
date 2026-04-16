import type { User } from "../types";
import UserAvatar from "./UserAvatar";

export default function UserAvatarList({ users }: { users: User[] }) {
  return (
    <div className="flex pr-2">
      {users.map((user) => (
        <div className="-mr-2">
          <UserAvatar key={user.id} {...user} />
        </div>
      ))}
    </div>
  );
}
