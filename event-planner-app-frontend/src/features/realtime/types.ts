/** Entity names the backend sends in `trip:changed` (see `register_tracked_model`). */
export type TripEntity =
  | "itinerary"
  | "event"
  | "accommodation"
  | "packing"
  | "wishlist"
  | "wishlist_item"
  | "wishlist_item_vote"
  | "flight"
  | "invite"
  | "itinerary_user";

/** Entity names the backend sends in `user:changed`: things that happen to you. */
export type UserEntity = "invite" | "itinerary_user";

export interface TripChangedPayload {
  tripId: number;
  entities: TripEntity[];
  byUserId: number | null;
}

export interface TripChangedWire {
  trip_id: number;
  entities: string[];
  by_user_id: number | null;
}

/** Sent to one user's own room, so it reaches people who aren't in the trip yet. */
export interface UserChangedWire {
  entities: string[];
  trip_ids: number[];
  by_user_id: number | null;
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
