import type { Day, Event } from "../events/types";
import { makeDays } from "../events/utils";
import { DEFAULT_PADDING } from "./constants";

export const getDaysWithFilter = (
  events: Event[],
  startDate: string,
  endDate: string,
): Day[] =>
  makeDays(events, startDate, endDate).map((day) => ({ ...day, show: true }));

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
}: {
  map: google.maps.Map;
  events: { latitude: number; longitude: number }[];
  defaultCenter?: { latitude: number; longitude: number };
  defaultBounds?: { north: number; east: number; south: number; west: number };
}) => {
  if (events.length === 0) {
    if (defaultCenter) {
      map.panTo({
        lat: defaultCenter.latitude,
        lng: defaultCenter.longitude,
      });
    } else if (defaultBounds) {
      map.fitBounds(defaultBounds, DEFAULT_PADDING);
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

  map.fitBounds(bounds, DEFAULT_PADDING);
};
