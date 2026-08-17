import { Map, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../store";

import type { Trip } from "../../trips/types";
import { setDays, setSearchEvents } from "../service/mapSlice";
import { fitToBounds, formatPlace, getDaysWithFilter } from "../utils";
import { CITY_RADIUS, DEFAULT_ZOOM, MAX_ZOOM, MIN_ZOOM } from "../constants";
import { EventSearch, DayFilter, FitToDay, RouteDetails, ZoomButtons } from ".";
import AccommodationMarkers from "./AccommodationMarkers";
import EventMarkers from "./EventMarkers";
import SearchEventMarkers from "./SearchEventMarkers";
import WishlistMarkers from "./WishlistMarkers";
import UserCoords from "./UserCoords";

export default function TripMap({ trip }: { trip: Trip }) {
  const { latitude, longitude, startDate, endDate, events } = trip;
  const dispatch = useDispatch();
  const { days } = useSelector((state: RootState) => state.map);
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);

  const map = useMap();

  const selectedEvents = days
    .filter((day) => day.show)
    .flatMap((day) => day.events);

  const cityBounds = {
    north: latitude + CITY_RADIUS,
    south: latitude - CITY_RADIUS,
    east: longitude + CITY_RADIUS,
    west: longitude - CITY_RADIUS,
  };

  useEffect(() => {
    if (!map) return;

    fitToBounds({ map, events: selectedEvents, defaultBounds: cityBounds });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, latitude, longitude]);

  useEffect(() => {
    dispatch(setDays(getDaysWithFilter(events, startDate, endDate)));
  }, [events, startDate, endDate, dispatch]);

  const placesLibrary = useMapsLibrary("places");

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
    <div className="relative w-full h-full md:h-[93.5vh] 2xl:h-[96vh] ">
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
        <EventMarkers />
        <SearchEventMarkers />
        <WishlistMarkers />
        <AccommodationMarkers />
        <UserCoords />
      </Map>
      <EventSearch
        destination={{ latitude: trip.latitude, longitude: trip.longitude }}
      />
      <div className="absolute top-4 right-2 flex flex-col gap-2 items-end">
        <DayFilter />
        <FitToDay />
      </div>
      <RouteDetails />
      <ZoomButtons />
    </div>
  );
}
