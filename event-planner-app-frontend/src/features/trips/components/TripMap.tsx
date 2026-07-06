import {
  AdvancedMarker,
  Map,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { X } from "lucide-react";

import type { Trip } from "../types";
import { differenceInDays } from "date-fns";
import { canUserEdit } from "../../users/utils";
import {
  setDays,
  setSelectedEvent,
  clearSearchEvents,
  setSearchEvents,
} from "../../maps/service/mapSlice";
import { fitToBounds, formatPlace, getDaysWithFilter } from "../../maps/utils";
import {
  CITY_RADIUS,
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
} from "../../maps/constants";
import {
  EventMarker,
  EventSearchMarker,
  EventSearch,
  DayFilter,
  EventSearchResultList,
  FitToDay,
  RouteDetails,
  ZoomButtons,
} from "../../maps/components";
import { EventCard } from "../../events/components";
import { toast } from "sonner";

const permissionEnum = {
  GRANTED: "GRANTED",
  DENIED: "DENIED",
  LOADING: "LOADING",
} as const;

// TODO: Add wishlist items to map as markers

export default function TripMap({ trip }: { trip: Trip }) {
  const { latitude, longitude, startDate, endDate, events } = trip;
  const dispatch = useDispatch();
  const { searchEvents, selectedEvent, days, currentRouteIndex, routes } =
    useSelector((state: RootState) => state.map);
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
        switch (error.code) {
          case error.PERMISSION_DENIED:
            return toast.error("Location denied!");
          case error.POSITION_UNAVAILABLE:
            return toast.error("Could not get location!");
        }
        setPermission(permissionEnum.DENIED);
      },
      { enableHighAccuracy: true },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearSearchEvents());
    };
  }, [dispatch]);

  const placesLibrary = useMapsLibrary("places");

  const currentRoute = routes?.[currentRouteIndex];
  const routeIds = [currentRoute?.from?.id, currentRoute?.to?.id];
  const eventMarkers = selectedEvents.map((event) => (
    <EventMarker
      day={differenceInDays(event.startAt, startDate) + 1}
      key={event.id}
      event={event}
      position={{ lat: event.latitude, lng: event.longitude }}
      onSelect={(event) => dispatch(setSelectedEvent(event))}
      selected={selectedEvent?.id === event.id || routeIds.includes(event.id)}
      isRouteStart={routeIds[0] === event.id}
      isRouteEnd={routeIds[1] === event.id}
    />
  ));

  const searchEventMarkers = searchEvents.map((event) => (
    <EventSearchMarker key={event.placeId} event={event} />
  ));

  const onDelete = () => {
    dispatch(setSelectedEvent(null));
  };

  const openPlaceResult = (placeId: string) => {
    if (!placesLibrary || !map) return;
    const placesService = new placesLibrary.PlacesService(map);
    placesService.getDetails(
      {
        placeId,
        fields: [
          "business_status",
          "opening_hours",
          "name",
          "formatted_address",
          "geometry",
          "place_id",
          "rating",
          "user_ratings_total",
          "types",
          "photos",
        ],
      },
      (place) => {
        if (place) dispatch(setSearchEvents([formatPlace(place)]));
      },
    );
  };

  return (
    <div className="relative w-full h-[93.5vh] 2xl:h-[96vh] ">
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
        onClick={(e) => e.detail.placeId && openPlaceResult(e.detail.placeId)}
        renderingType="VECTOR"
        rotateControl
        tiltInteractionEnabled
        headingInteractionEnabled
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
      {canUserEdit(trip.role) && (
        <EventSearch
          destination={{ latitude: trip.latitude, longitude: trip.longitude }}
        />
      )}
      <div className="absolute top-4 right-2 flex flex-col gap-2 items-end">
        <DayFilter />
        <FitToDay />
        <RouteDetails />
      </div>
      <ZoomButtons userCoords={userCoords} />
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
      {canUserEdit(trip.role) && searchEvents.length > 0 && (
        <div className="absolute bottom-4 w-full px-4 ">
          <button
            onClick={() => dispatch(clearSearchEvents())}
            className="absolute z-2 btn-secondary p-1 right-1 -top-3"
          >
            <X size={20} />
          </button>
          <EventSearchResultList />
        </div>
      )}
    </div>
  );
}
