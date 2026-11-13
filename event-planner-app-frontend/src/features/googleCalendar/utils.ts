import type { CalendarStatus, ConnectResult } from "./types";

export const CONNECT_RESULT_MESSAGES: Record<ConnectResult, string> = {
  connected: "Google Calendar connected.",
  failed: "Could not connect Google Calendar. Please try again.",
};

export function parseConnectResult(value: string | null): ConnectResult | null {
  if (value === "connected" || value === "failed") {
    return value;
  }
  return null;
}

export function isTripSynced(
  status: CalendarStatus | undefined,
  tripId: number,
) {
  return status?.syncedTripIds.includes(tripId) ?? false;
}

export function tripSyncLabel(synced: boolean) {
  return synced ? "Stop syncing to Google Calendar" : "Sync to Google Calendar";
}
