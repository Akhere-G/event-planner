import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { Socket } from "socket.io-client";
import { apiSlice } from "../api/apiSlice";
import type { RootState } from "../../store";
import { entitiesToTags } from "./entityTags";
import { remoteChanged, resetRealtime, setPresence } from "./realtimeSlice";
import { createTripSocket } from "./socket";
import type { JoinAck, PresenceUser, PresenceWireUser } from "./types";

const HEARTBEAT_MS = 20_000;

let activeSocket: { socket: Socket; tripId: number } | null = null;
let viewingDay: string | null = null;

/** Tells everyone else which day this user is looking at (null = none). */
export function setViewingDay(day: string | null) {
  viewingDay = day;
  if (activeSocket?.socket.connected) {
    activeSocket.socket.emit("presence:heartbeat", {
      trip_id: activeSocket.tripId,
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

    const socket = createTripSocket();
    activeSocket = { socket, tripId };

    socket.on("connect", () => {
      socket.emit(
        "trip:join",
        { trip_id: tripId, day: viewingDay },
        (ack: JoinAck) => {
          if (!ack?.ok) socket.disconnect();
        },
      );
    });

    socket.on(
      "trip:changed",
      (payload: { trip_id: number; entities: string[]; by_user_id: number | null }) => {
        if (payload.trip_id !== tripId) return;
        // Our own mutations already invalidate their tags.
        if (payload.by_user_id !== null && payload.by_user_id === myUserId) return;

        dispatch(apiSlice.util.invalidateTags(entitiesToTags(payload.entities, tripId)));
        dispatch(remoteChanged(payload.entities));
      },
    );

    socket.on(
      "presence:update",
      (payload: { trip_id: number; users: PresenceWireUser[] }) => {
        if (payload.trip_id !== tripId) return;
        const users: PresenceUser[] = payload.users.map((u) => ({
          userId: u.user_id,
          name: u.name,
          day: u.day,
        }));
        dispatch(setPresence(users));
      },
    );

    const heartbeat = setInterval(() => {
      if (socket.connected) {
        socket.emit("presence:heartbeat", { trip_id: tripId, day: viewingDay });
      }
    }, HEARTBEAT_MS);

    return () => {
      clearInterval(heartbeat);
      socket.disconnect();
      if (activeSocket?.socket === socket) activeSocket = null;
      dispatch(resetRealtime());
    };
  }, [tripId, myUserId, dispatch]);
}
