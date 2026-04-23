import { AdvancedMarker, Map, useMap } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { LocateIcon, Minus, Plus, X } from "lucide-react";
import type { Event } from "../../events/types";
import { EventCard, EventMarker } from "../../events/components";

import { useUpdateEvent } from "../hooks";
// import { makeDays } from "../../events/utils";
import type { Trip } from "../types";
import { differenceInDays } from "date-fns";

const MAX_ZOOM = 17;
const MIN_ZOOM = 10;
const DEFAULT_ZOOM = 12;

const permissionEnum = {
  GRANTED: "GRANTED",
  DENIED: "DENIED",
  LOADING: "LOADING",
} as const;

export default function TripMap({ trip }: { trip: Trip }) {
  const {
    latitude,
    longitude,
    role,
    startDate,
    // endDate,
    events: defaultEvents,
    id: tripId,
  } = trip;
  const [events, setEvents] = useState(defaultEvents);
  const [, setPermission] = useState<keyof typeof permissionEnum>(
    permissionEnum.LOADING,
  );
  const [userCoords, setUserCoords] = useState<GeolocationCoordinates | null>(
    null,
  );
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);
  const { handleDelete, handleEdit } = useUpdateEvent({
    tripId,
    onDelete: () => setSelectedEvent(null),
  });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const map = useMap();

  // const days = makeDays(events, startDate, endDate);

  useEffect(() => {
    setEvents(defaultEvents);
  }, [defaultEvents]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserCoords(position.coords);
        setPermission(permissionEnum.GRANTED);
      },
      (error) => {
        console.error(error);
        setPermission(permissionEnum.DENIED);
      },
      { enableHighAccuracy: true },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const zoomIn = () => {
    if (map)
      map.setZoom(Math.min((map.getZoom() || DEFAULT_ZOOM) + 1, MAX_ZOOM));
  };
  const zoomOut = () => {
    if (map)
      map.setZoom(Math.max((map.getZoom() || DEFAULT_ZOOM) - 1, MIN_ZOOM));
  };

  const zoomToUser = () => {
    const onPermissionGranted = (position: GeolocationPosition) => {
      map?.setCenter({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      setUserCoords(position.coords);
    };
    const onPermissionDenied = (positionError: GeolocationPositionError) => {
      console.error(positionError.message);
      // TODO: Add notification
    };
    navigator.geolocation.getCurrentPosition(
      onPermissionGranted,
      onPermissionDenied,
    );
  };

  const renderedMarkers = events.map((event) => (
    <EventMarker
      day={differenceInDays(event.startAt, startDate)}
      key={event.id}
      event={event}
      position={{ lat: event.latitude, lng: event.longitude }}
      onSelect={setSelectedEvent}
    />
  ));

  return (
    <div className="relative w-full h-[93.5vh] 2xl:h-[96vh] isolate will-change-transform">
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
        onClick={(a) => console.log("click", a)}
      >
        {renderedMarkers}
        {userCoords && (
          <AdvancedMarker
            position={{ lat: userCoords.latitude, lng: userCoords.longitude }}
          >
            <div className="w-6 h-6 rounded-full bg-blue-400/70 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              </div>
            </div>
          </AdvancedMarker>
        )}
      </Map>
      <div className="absolute bottom-4 right-2 flex flex-col gap-2">
        <button onClick={zoomToUser} className="p-2 btn-primary">
          <LocateIcon size={20} />
        </button>
        <button onClick={zoomIn} className="p-2 btn-primary">
          <Plus size={20} />
        </button>
        <button onClick={zoomOut} className="p-2 btn-primary">
          <Minus size={20} />
        </button>
      </div>
      {selectedEvent && (
        <div
          className={`z-10 absolute bottom-14 md:bottom-2 flex w-[140%] pt-2 pl-4 
          pr-14 scale-75 left-0 -translate-x-[18vw] md:w-[130%] md:-translate-x-[8vw]`}
        >
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
