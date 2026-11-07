import { useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

/** Ids of everyone live on the trip, including the current user. */
export function useOnlineUserIds(): ReadonlySet<number> {
  const presence = useSelector((state: RootState) => state.realtime.presence);

  return useMemo(
    () =>
      new Set(
        presence.flatMap((user) => (user.userId === null ? [] : [user.userId])),
      ),
    [presence],
  );
}

/** Everyone live on the trip except the current user. */
export function useOtherPresence() {
  const myUserId = useSelector((state: RootState) => state.auth.userId);
  const presence = useSelector((state: RootState) => state.realtime.presence);

  // Guests can't be told apart from ourselves, so only list them for signed-in users.
  return presence.filter((u) =>
    u.userId === null ? myUserId !== null : u.userId !== myUserId,
  );
}

/** Live viewers who aren't signed in, so have no member avatar of their own. */
export function useGuestViewers() {
  return useOtherPresence().filter((u) => u.userId === null);
}

export function useDayViewers(date: string) {
  return useOtherPresence().filter((u) => u.day === date);
}
