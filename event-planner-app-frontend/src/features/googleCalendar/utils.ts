import type { CalendarStatus } from "./types";

export const CONNECT_RESULT_PARAM = "calendar";

export const isTripSynced = (
  status: CalendarStatus | undefined,
  tripId: number,
) => !!status?.syncedTripIds.includes(tripId);

/** The message to toast when Google sends the user back to Settings. */
export const connectResultMessage = (param: string | null) =>
  param === "connected" ? "Google Calendar connected." : null;
