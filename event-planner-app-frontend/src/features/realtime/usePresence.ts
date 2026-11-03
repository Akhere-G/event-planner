import { useSelector } from "react-redux";
import type { RootState } from "../../store";

/** Everyone live on the trip except the current user. */
export function useOtherPresence() {
  const myUserId = useSelector((state: RootState) => state.auth.userId);
  const presence = useSelector((state: RootState) => state.realtime.presence);

  // Guests can't be told apart from ourselves, so only list them for signed-in users.
  return presence.filter((u) =>
    u.userId === null ? myUserId !== null : u.userId !== myUserId,
  );
}

export function useDayViewers(date: string) {
  return useOtherPresence().filter((u) => u.day === date);
}
