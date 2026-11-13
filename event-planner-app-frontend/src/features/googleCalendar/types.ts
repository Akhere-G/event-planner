export interface CalendarStatus {
  connected: boolean;
  syncedTripIds: number[];
}

export interface AuthorisationLink {
  url: string;
}

export type ConnectResult = "connected" | "failed";
