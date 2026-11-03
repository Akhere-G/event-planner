export interface CalendarStatus {
  connected: boolean;
  syncedTripIds: number[];
}

export interface AuthorisationLink {
  url: string;
}

export interface TripSyncPayload {
  tripId: number;
}
