import { AdvancedMarker, Map, useMap } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { LocateIcon, Minus, Plus, X } from "lucide-react";
import type { EventSearchResult } from "../../events/types";
import {
  DayFilter,
  EventCard,
  EventMarker,
  EventSearch,
  FitToDay,
  SearchEventMarker,
  EventSearchResultList,
} from "../../events/components";

import type { Trip } from "../types";
import { differenceInDays } from "date-fns";
import { canUserEdit } from "../../users/utils";
import {
  setDays,
  setSearchEvents,
  setSearchIndex,
  setSelectedEvent,
} from "../../maps/service/mapSlice";
import { fitToBounds, getDaysWithFilter } from "../../maps/utils";

const MAX_ZOOM = 17;
const MIN_ZOOM = 10;
const DEFAULT_ZOOM = 12;
const CITY_RADIUS = 0.06;

const permissionEnum = {
  GRANTED: "GRANTED",
  DENIED: "DENIED",
  LOADING: "LOADING",
} as const;

export default function TripMap({ trip }: { trip: Trip }) {
  const { latitude, longitude, role, startDate, endDate, events } = trip;
  const dispatch = useDispatch();
  const { searchEvents, selectedEvent, days } = useSelector(
    (state: RootState) => state.map,
  );
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);

  const [userCoords, setUserCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [, setPermission] = useState<keyof typeof permissionEnum>(
    permissionEnum.LOADING,
  );

  const map = useMap();

  const selectedEvents = days
    .filter((day) => day.show)
    .flatMap((day) => day.events);

  useEffect(() => {
    if (!map) return;

    const defaultBounds = {
      north: latitude + CITY_RADIUS,
      south: latitude - CITY_RADIUS,
      east: longitude + CITY_RADIUS,
      west: longitude - CITY_RADIUS,
    };
    fitToBounds({ map, events: selectedEvents, defaultBounds });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, latitude, longitude]);

  useEffect(() => {
    dispatch(setDays(getDaysWithFilter(events, startDate, endDate)));
  }, [events, startDate, endDate, dispatch]);

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
  }, [dispatch]);

  const zoomIn = () => {
    if (map)
      map.setZoom(Math.min((map.getZoom() || DEFAULT_ZOOM) + 1, MAX_ZOOM));
  };
  const zoomOut = () => {
    if (map)
      map.setZoom(Math.max((map.getZoom() || DEFAULT_ZOOM) - 1, MIN_ZOOM));
  };

  const zoomToUser = () => {
    if (!userCoords || !map) return;

    map.panTo({
      lat: userCoords.latitude,
      lng: userCoords.longitude,
    });
  };

  const onSelectSearchMarker = (event: EventSearchResult) => {
    const index = searchEvents.findIndex((e) => e.placeId === event.placeId);
    if (index === -1) return;
    dispatch(setSearchIndex(index));
  };

  const eventMarkers = selectedEvents.map((event) => (
    <EventMarker
      day={differenceInDays(event.startAt, startDate) + 1}
      key={event.id}
      event={event}
      position={{ lat: event.latitude, lng: event.longitude }}
      onSelect={(event) => dispatch(setSelectedEvent(event))}
    />
  ));

  const searchEventMarkers = searchEvents.map((event) => (
    <SearchEventMarker
      key={event.placeId}
      place={event}
      onSelect={onSelectSearchMarker}
    />
  ));

  const onDelete = () => {
    dispatch(setSelectedEvent(null));
  };

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
      >
        {eventMarkers}
        {searchEventMarkers}
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
      <div className="absolute z-10 top-4 right-2 flex flex-col gap-2 items-end">
        <EventSearch
          destination={{ latitude: trip.latitude, longitude: trip.longitude }}
        />
        <DayFilter />
        <FitToDay />
      </div>
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
          className={`absolute bottom-14 md:bottom-2 flex w-[140%] pt-2 pl-4 
          pr-14 scale-75 left-0 -translate-x-[18vw] md:w-[130%] md:-translate-x-[8vw]`}
        >
          <button
            onClick={() => dispatch(setSelectedEvent(null))}
            className="absolute btn-secondary p-1 right-11 -top-2"
          >
            <X size={20} />
          </button>
          <EventCard
            event={selectedEvent}
            key={selectedEvent.name}
            role={role}
            onDelete={onDelete}
          />
        </div>
      )}
      {canUserEdit(trip.role) && searchEvents.length > 0 && (
        <div className="absolute z-30 bottom-20 w-full px-4 ">
          <button
            onClick={() => dispatch(setSearchEvents([]))}
            className="absolute z-1 btn-secondary p-1 right-1 -top-3"
          >
            <X size={20} />
          </button>
          <EventSearchResultList />
        </div>
      )}
    </div>
  );
}
