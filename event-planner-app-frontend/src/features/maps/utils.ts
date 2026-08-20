import { DEFAULT_PADDING } from "./constants";
import type { EventSearchResult, Tag } from "./types";

export const getBoundsForEvents = (
  events: { latitude: number; longitude: number }[],
) => {
  let north = -Infinity;
  let east = -Infinity;
  let south = Infinity;
  let west = Infinity;

  events.forEach((event) => {
    if (event.latitude > north) {
      north = event.latitude;
    }

    if (event.latitude < south) {
      south = event.latitude;
    }

    if (event.longitude > east) {
      east = event.longitude;
    }

    if (event.longitude < west) {
      west = event.longitude;
    }
  });

  return { north, east, south, west };
};

export const fitToBounds = ({
  map,
  events,
  defaultCenter,
  defaultBounds,
  padding = DEFAULT_PADDING,
}: {
  map: google.maps.Map;
  events: { latitude: number; longitude: number }[];
  defaultCenter?: { latitude: number; longitude: number };
  defaultBounds?: { north: number; east: number; south: number; west: number };
  padding?:
    | number
    | { top: number; left: number; bottom: number; right: number };
}) => {
  if (events.length === 0) {
    if (defaultCenter) {
      map.panTo({
        lat: defaultCenter.latitude,
        lng: defaultCenter.longitude,
      });
    } else if (defaultBounds) {
      map.fitBounds(defaultBounds, padding);
    }
    return;
  }

  if (events.length === 1) {
    map.panTo({
      lat: events[0].latitude,
      lng: events[0].longitude,
    });
    return;
  }

  const bounds = getBoundsForEvents(events);

  map.fitBounds(bounds, padding);
};

export const formatPlace = (
  place: google.maps.places.PlaceResult,
): EventSearchResult => {
  const tags: Tag[] = [];

  if (place.business_status !== "OPERATIONAL") {
    tags.push({ text: "Closed", color: "var(--color-error)" });
  }

  if (place.opening_hours?.isOpen) {
    tags.push({ text: "Open", color: "var(--color-success)" });
  }

  return {
    name: place.name ?? "",
    address: place.formatted_address ?? "",
    latitude: place.geometry?.location?.lat() ?? 0,
    longitude: place.geometry?.location?.lng() ?? 0,
    placeId: place.place_id ?? "",
    isAdded: false,
    rating: place.rating ?? 0,
    totalReviews: place.user_ratings_total ?? 0,
    category:
      place.types?.find((t) => t !== "establishment")?.replaceAll("_", " ") ??
      "general",
    photos:
      place.photos?.map(({ getUrl, ...photo }) => ({
        url: getUrl(),
        ...photo,
      })) ?? [],
    types: place.types ?? [],
    tags,
  };
};

export const getCityBounds = ({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) => {
  return {
    north: latitude + 0.1,
    south: latitude - 0.1,
    east: longitude + 0.1,
    west: longitude - 0.1,
  };
};
