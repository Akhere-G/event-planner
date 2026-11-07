import type { TagDescription } from "@reduxjs/toolkit/query";
import type { tagTypes } from "../api/apiSlice";

export type ApiTag = TagDescription<(typeof tagTypes)[number]>;

/**
 * Maps the entity names the backend sends in `trip:changed` to the RTK Query
 * tags to invalidate.
 *
 * Extension point: PR5 (expenses) and PR8 (flights) add per-trip tags to
 * `tagTypes` and register them here, e.g.
 *   expense: (tripId) => [{ type: "Expenses", id: tripId }],
 * and the backend registers the model with `register_tracked_model`.
 */
const ENTITY_TAGS: Record<string, (tripId: number) => ApiTag[]> = {
  itinerary: (tripId) => [{ type: "Trips", id: tripId }],
  event: (tripId) => [{ type: "Trips", id: tripId }],
  accommodation: () => ["Accommodations"],
  packing: () => ["PackingItem"],
  wishlist: () => ["Wishlists"],
};

export function entitiesToTags(entities: string[], tripId: number): ApiTag[] {
  const tags = new Map<string, ApiTag>();

  for (const entity of entities) {
    for (const tag of ENTITY_TAGS[entity]?.(tripId) ?? []) {
      tags.set(JSON.stringify(tag), tag);
    }
  }

  return [...tags.values()];
}
