import type { TagDescription } from "@reduxjs/toolkit/query";
import type { tagTypes } from "../api/apiSlice";
import { expenseDependentTags } from "../expenses/tags";
import type { TripEntity, UserEntity } from "./types";

export type ApiTag = TagDescription<(typeof tagTypes)[number]>;

const wishlistTags = () => ["Wishlists" as const];

/**
 * Maps the entity names the backend sends in `trip:changed` to the RTK Query
 * tags to invalidate.
 *
 * Extension point: a new tracked model registers itself on the backend with
 * `register_tracked_model`, then gets an entry here (and in `TripEntity`).
 */
const TRIP_ENTITY_TAGS: Record<TripEntity, (tripId: number) => ApiTag[]> = {
  itinerary: (tripId) => [{ type: "Trips", id: tripId }],
  event: (tripId) => [{ type: "Events", id: tripId }],
  accommodation: () => ["Accommodations"],
  packing: () => ["PackingItem"],
  wishlist: wishlistTags,
  wishlist_item: wishlistTags,
  wishlist_item_vote: wishlistTags,
  flight: (tripId) => [{ type: "Flights", id: tripId }],
  expense: expenseDependentTags,
  expense_share: expenseDependentTags,
  settlement: (tripId) => [{ type: "Settlements", id: tripId }],
  invite: () => [{ type: "Invites", id: "LIST" }],
  // Membership shows up in the trip's avatars and in the users table.
  itinerary_user: (tripId) => [
    { type: "Trips", id: tripId },
    { type: "Users", id: "LIST" },
  ],
};

/**
 * Tags for changes that happen to the signed-in user, who may not be in the
 * trip: an invite arriving, being revoked, or their membership changing.
 */
const USER_ENTITY_TAGS: Record<UserEntity, (tripIds: number[]) => ApiTag[]> = {
  invite: () => [{ type: "Invites", id: "LIST" }],
  itinerary_user: (tripIds) => [
    { type: "Trips", id: "LIST" },
    ...tripIds.map((id): ApiTag => ({ type: "Trips", id })),
  ],
};

function dedupe(tags: ApiTag[]): ApiTag[] {
  return [...new Map(tags.map((tag) => [JSON.stringify(tag), tag])).values()];
}

// Names arrive over the wire, so lookups must tolerate ones this build doesn't know.
type Lookup<Arg> = Partial<Record<string, (arg: Arg) => ApiTag[]>>;

export function entitiesToTags(entities: string[], tripId: number): ApiTag[] {
  const lookup: Lookup<number> = TRIP_ENTITY_TAGS;
  return dedupe(entities.flatMap((entity) => lookup[entity]?.(tripId) ?? []));
}

export function userEntitiesToTags(
  entities: string[],
  tripIds: number[],
): ApiTag[] {
  const lookup: Lookup<number[]> = USER_ENTITY_TAGS;
  return dedupe(entities.flatMap((entity) => lookup[entity]?.(tripIds) ?? []));
}
