import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { Socket } from "socket.io-client";
import { apiSlice } from "../api/apiSlice";
import type { RootState } from "../../store";
import { entitiesToTags } from "./entityTags";
import { remoteChanged, resetRealtime, setPresence } from "./realtimeSlice";
import { acquireSocket, releaseSocket } from "./socket";
import type {
  JoinAck,
  PresenceUser,
  PresenceWireUser,
  TripChangedWire,
} from "./types";

import { AI_TASK_EVENT, handleAiTaskChanged } from "../aiTasks/realtime";
import type { AiTaskChangedWire } from "../aiTasks/types";

const HEARTBEAT_MS = 20_000;

let activeTrip: { socket: Socket; tripId: number } | null = null;
let viewingDay: string | null = null;

/** Tells everyone else which day this user is looking at (null = none). */
export function setViewingDay(day: string | null) {
  viewingDay = day;
  if (activeTrip?.socket.connected) {
    activeTrip.socket.emit("presence:heartbeat", {
      trip_id: activeTrip.tripId,
      day,
    });
  }
}

/**
 * Joins the trip's live room: refetches cached data when someone else changes
 * the trip, and keeps the presence list up to date. Last write wins; this only
 * keeps screens fresh.
 */
export default function useTripRealtime(tripId: number) {
  const dispatch = useDispatch();
  const myUserId = useSelector((state: RootState) => state.auth.userId);

  useEffect(() => {
    if (!Number.isInteger(tripId)) return;

    const socket = acquireSocket();
    activeTrip = { socket, tripId };

    // Runs on first connect and again after every reconnect, since the server
    // forgets room membership when the connection drops.
    const join = () => {
      socket.emit(
        "trip:join",
        { trip_id: tripId, day: viewingDay },
        (ack: JoinAck) => {
          if (!ack?.ok) socket.off("connect", join);
        },
      );
    };

    const onTripChanged = (payload: TripChangedWire) => {
      if (payload.trip_id !== tripId) return;
      // Our own mutations already invalidate their tags.
      if (payload.by_user_id !== null && payload.by_user_id === myUserId)
        return;

      dispatch(
        apiSlice.util.invalidateTags(entitiesToTags(payload.entities, tripId)),
      );
      dispatch(remoteChanged(payload.entities));
    };

    const onPresence = (payload: {
      trip_id: number;
      users: PresenceWireUser[];
    }) => {
      if (payload.trip_id !== tripId) return;
      const users: PresenceUser[] = payload.users.map((u) => ({
        userId: u.user_id,
        name: u.name,
        day: u.day,
      }));
      dispatch(setPresence(users));
    };

    // Signed-in users hear about their tasks on their own room (see
    // useUserRealtime); only anonymous visitors are told through the trip's.
    const onAiTaskChanged = (payload: AiTaskChangedWire) => {
      if (myUserId === null && payload.trip_id === tripId) {
        handleAiTaskChanged(payload, dispatch);
      }
    };

    socket.on("connect", join);
    socket.on(AI_TASK_EVENT, onAiTaskChanged);
    socket.on("trip:changed", onTripChanged);
    socket.on("presence:update", onPresence);
    if (socket.connected) join();

    const heartbeat = setInterval(() => {
      if (socket.connected) {
        socket.emit("presence:heartbeat", { trip_id: tripId, day: viewingDay });
      }
    }, HEARTBEAT_MS);

    return () => {
      clearInterval(heartbeat);
      socket.off("connect", join);
      socket.off(AI_TASK_EVENT, onAiTaskChanged);
      socket.off("trip:changed", onTripChanged);
      socket.off("presence:update", onPresence);
      if (socket.connected) socket.emit("trip:leave", { trip_id: tripId });
      if (activeTrip?.socket === socket) activeTrip = null;
      releaseSocket(socket);
      dispatch(resetRealtime());
    };
  }, [tripId, myUserId, dispatch]);
}
