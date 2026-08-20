import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../store";
import EventMarker from "./EventMarker";
import { differenceInDays } from "date-fns";
import { useGetTripQuery } from "../../trips/services/tripsApiSlice";
import { useParams } from "react-router";
import { setSelectedEvent, setDayOpen } from "../service/mapSlice";
import { useEffect } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { fitToBounds } from "../utils";
import type { Event } from "../../events/types";

export default function EventMarkers() {
  const dispatch = useDispatch();
  const tripId = Number(useParams().tripId);
  const { data } = useGetTripQuery(tripId);
  const trip = data?.data;

  const { days, selectedEvent, routes, currentRouteIndex } = useSelector(
    (state: RootState) => state.map,
  );

  const map = useMap();

  useEffect(() => {
    if (selectedEvent && map) {
      fitToBounds({ map, events: [selectedEvent] });
    }
  }, [selectedEvent, map]);

  const selectedEvents = days
    .filter((day) => day.show)
    .flatMap((day) => day.events);
  const currentRoute = routes?.[currentRouteIndex];

  const routeIds = [currentRoute?.from?.id, currentRoute?.to?.id];

  const handleSelectEvent = (event: Event) => {
    const eventDay = event.startAt.slice(0, 10);

    dispatch(setSelectedEvent(event));
    dispatch(setDayOpen(eventDay));
  };

  if (!trip) return null;

  return (
    <>
      {selectedEvents.map((event) => (
        <EventMarker
          day={differenceInDays(event.startAt, trip.startDate) + 1}
          key={event.id}
          event={event}
          position={{ lat: event.latitude, lng: event.longitude }}
          onSelect={handleSelectEvent}
          selected={
            selectedEvent?.id === event.id || routeIds.includes(event.id)
          }
          isRouteStart={routeIds[0] === event.id}
          isRouteEnd={routeIds[1] === event.id}
        />
      ))}
    </>
  );
}
