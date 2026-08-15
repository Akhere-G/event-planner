import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../store";
import EventMarker from "./EventMarker";
import { differenceInDays } from "date-fns";
import { useGetTripQuery } from "../../trips/services/tripsApiSlice";
import { useParams } from "react-router";
import { setSelectedEvent } from "../service/mapSlice";
import { X } from "lucide-react";
import EventCard from "../../events/components/EventCard";
import { useEffect } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { fitToBounds } from "../utils";

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

  const onDelete = () => {
    dispatch(setSelectedEvent(null));
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
          onSelect={(event) => dispatch(setSelectedEvent(event))}
          selected={
            selectedEvent?.id === event.id || routeIds.includes(event.id)
          }
          isRouteStart={routeIds[0] === event.id}
          isRouteEnd={routeIds[1] === event.id}
        />
      ))}

      {selectedEvent && (
        <div className={`z-2 absolute bottom-0 px-2 md:px-4 pb-5 w-full`}>
          <button
            onClick={() => dispatch(setSelectedEvent(null))}
            className="absolute btn-secondary p-1 right-0 -top-4 md:-top-4"
          >
            <X size={20} />
          </button>
          <EventCard
            event={selectedEvent}
            key={selectedEvent.name}
            onDelete={onDelete}
          />
        </div>
      )}
    </>
  );
}
