import { Map, useMap } from "@vis.gl/react-google-maps";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { Minus, Plus, X } from "lucide-react";
import type { Event } from "../../events/types";
import { EventCard, EventMarker } from "../../events/components";
import {
  useDeleteEventMutation,
  useUpdateEventMutation,
} from "../../events/service/eventApiSlice";
import { isFetchBaseQueryError } from "../../api/utils";

const MAX_ZOOM = 17;
const MIN_ZOOM = 10;
const DEFAULT_ZOOM = 12;

export default function TripMap({
  latitude,
  longitude,
  events,
  role,
  tripId,
}: {
  latitude: number;
  longitude: number;
  events: Event[];
  role: string;
  tripId: number;
}) {
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);
  const [deleteEvent] = useDeleteEventMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const map = useMap();

  const zoomIn = () => {
    if (map)
      map.setZoom(Math.min((map.getZoom() || DEFAULT_ZOOM) + 1, MAX_ZOOM));
  };
  const zoomOut = () => {
    if (map)
      map.setZoom(Math.max((map.getZoom() || DEFAULT_ZOOM) - 1, MIN_ZOOM));
  };

  async function handleDelete(eventId: number) {
    try {
      await deleteEvent({ tripId: Number(tripId), eventId }).unwrap();
      setSelectedEvent(null);
    } catch (err) {
      if (isFetchBaseQueryError(err) && err.status === 404) {
        console.log("Event not found");
        // TODO: Add toast notifcation
      }
    }
  }

  async function handleEdit(eventId: number, updatedEvent: Partial<Event>) {
    try {
      await updateEvent({
        tripId: Number(tripId),
        eventId,
        updatedEvent,
      }).unwrap();
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        if (err.status === 404) {
          console.log("Event not found");
          // TODO: Add toast notifcation
        } else if (err.status === 400) {
          // TODO: Add toast notifcation
          throw err;
        }
      }
    }
  }

  const renderedMarkers = useMemo(() => {
    return events.map((event) => (
      <EventMarker
        key={event.id}
        event={event}
        position={{ lat: event.latitude, lng: event.longitude }}
        onSelect={setSelectedEvent}
      />
    ));
  }, [events]);

  console.log("render");
  return (
    <div className="relative w-1/2 md:w-full h-[90vh] isolate will-change-transform">
      <Map
        mapId="e74fd7bd6c063337caf66343"
        maxZoom={MAX_ZOOM}
        minZoom={MIN_ZOOM}
        className="w-full h-full"
        defaultCenter={{ lat: latitude, lng: longitude }}
        defaultZoom={DEFAULT_ZOOM}
        disableDefaultUI
        reuseMaps
        colorScheme={darkMode ? "DARK" : "LIGHT"}
        gestureHandling="greedy"
      >
        {renderedMarkers}
      </Map>
      <button
        onClick={zoomIn}
        className="z-10 p-2 top-5 right-1 absolute btn-primary"
      >
        <Plus size={20} />
      </button>
      <button
        onClick={zoomOut}
        className=" z-10 p-2 top-18 right-1 absolute btn-primary"
      >
        <Minus size={20} />
      </button>
      {selectedEvent && (
        <div className="absolute top-4 flex w-full pt-2 pl-4 pr-14">
          <button
            onClick={() => setSelectedEvent(null)}
            className="absolute btn-secondary p-1 right-11 -top-2"
          >
            <X size={20} />
          </button>
          <EventCard
            key={selectedEvent.name}
            role={role}
            event={selectedEvent}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
          />
        </div>
      )}
    </div>
  );
}
