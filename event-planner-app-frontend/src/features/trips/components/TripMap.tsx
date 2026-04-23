import { Map, useMap } from "@vis.gl/react-google-maps";
import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { Minus, Plus, X } from "lucide-react";
import type { Event } from "../../events/types";
import { EventCard, EventMarker } from "../../events/components";

import { useUpdateEvent } from "../hooks";

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
  const { handleDelete, handleEdit } = useUpdateEvent({
    tripId,
    onDelete: () => setSelectedEvent(null),
  });
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

  const renderedMarkers = events.map((event) => (
    <EventMarker
      key={event.id}
      event={event}
      position={{ lat: event.latitude, lng: event.longitude }}
      onSelect={setSelectedEvent}
    />
  ));

  return (
    <div className="relative w-full h-[93.5vh] isolate will-change-transform">
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
        className="z-10 p-2 bottom-17 right-1 absolute btn-primary"
      >
        <Plus size={20} />
      </button>
      <button
        onClick={zoomOut}
        className=" z-10 p-2 bottom-7 right-1 absolute btn-primary"
      >
        <Minus size={20} />
      </button>
      {selectedEvent && (
        <div className="z-10 absolute bottom-14 md:bottom-5 flex w-[150%] pt-2 pl-4 pr-14 scale-75 left-0 -translate-x-1/7">
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
