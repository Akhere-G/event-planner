import { isApiError } from "../api/utils";
import type { CalendarStatus } from "./types";

export const CONNECT_RESULT_PARAM = "calendar";

export const isTripSynced = (
  status: CalendarStatus | undefined,
  tripId: number,
) => !!status?.syncedTripIds.includes(tripId);

/** The message to toast when Google sends the user back to Settings. */
export const connectResultMessage = (param: string | null) =>
  param === "connected" ? "Google Calendar connected." : null;

export const apiErrorMessage = (err: unknown, fallback: string) =>
  isApiError(err) ? err.data.message : fallback;

export const tripSyncLabel = (
  status: CalendarStatus | undefined,
  tripId: number,
) => {
  if (!status?.connected) return "Connect Google Calendar in Settings to sync";
  return isTripSynced(status, tripId)
    ? "Stop syncing with Google Calendar"
    : "Sync with Google Calendar";
};
