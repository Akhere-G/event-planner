import type { User } from "../types";
import { useGuestViewers, useOnlineUserIds } from "../../realtime/usePresence";
import UserAvatar from "./UserAvatar";

export default function UserAvatarList({ users }: { users: User[] }) {
  const onlineUserIds = useOnlineUserIds();
  const guests = useGuestViewers();

  return (
    <div className="flex pr-2">
      {users.map((user) => (
        <div key={user.id} className="-mr-2">
          <UserAvatar {...user} isOnline={onlineUserIds.has(user.id)} />
        </div>
      ))}
      {guests.map((guest, i) => (
        <div key={`guest-${i}`} className="-mr-2">
          <UserAvatar id={0} username={guest.name} isOnline />
        </div>
      ))}
    </div>
  );
}
