import type { Day, Event } from "../events/types";
import { makeDays } from "../events/utils";

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
