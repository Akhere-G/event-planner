export type TripEntity =
  | "itinerary"
  | "event"
  | "accommodation"
  | "packing"
  | "wishlist";

export interface TripChangedPayload {
  tripId: number;
  entities: string[];
  byUserId: number | null;
}

export interface PresenceUser {
  userId: number | null;
  name: string;
  day: string | null;
}

export interface JoinAck {
  ok: boolean;
  error?: string;
  role?: string;
}

export interface PresenceWireUser {
  user_id: number | null;
  name: string;
  day: string | null;
}
