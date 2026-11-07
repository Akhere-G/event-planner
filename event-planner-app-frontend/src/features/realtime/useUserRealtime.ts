import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { apiSlice } from "../api/apiSlice";
import type { RootState } from "../../store";
import { userEntitiesToTags } from "./entityTags";
import { acquireSocket, releaseSocket } from "./socket";
import type { UserChangedWire } from "./types";

/**
 * Listens on the signed-in user's own room, which is how someone who is not
 * (yet) in a trip hears about an invite arriving or being revoked, or about
 * being added to or removed from a trip.
 */
export default function useUserRealtime() {
  const dispatch = useDispatch();
  const myUserId = useSelector((state: RootState) => state.auth.userId);

  useEffect(() => {
    if (myUserId === null) return;

    const socket = acquireSocket();

    const onUserChanged = (payload: UserChangedWire) => {
      // Our own mutations already invalidate their tags.
      if (payload.by_user_id === myUserId) return;

      dispatch(
        apiSlice.util.invalidateTags(
          userEntitiesToTags(payload.entities, payload.trip_ids),
        ),
      );
    };

    socket.on("user:changed", onUserChanged);

    return () => {
      socket.off("user:changed", onUserChanged);
      releaseSocket(socket);
    };
  }, [myUserId, dispatch]);
}
