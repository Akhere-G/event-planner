import { useState } from "react";
import type { EventSearchResult } from "../types";
import { Search, X } from "lucide-react";
import { LocationInput } from "../../../components";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { fitToBounds } from "../../maps/utils";
import { setSearchEvents } from "../../maps/service/mapSlice";
import { useDispatch } from "react-redux";

export function EventSearch({
  destination,
  onPlaceSelect,
}: {
  destination: { latitude: number; longitude: number };
  onPlaceSelect: (eventSearchResult: EventSearchResult[]) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const { latitude, longitude } = destination;

  const map = useMap();
  const placesLibrary = useMapsLibrary("places");

  const cityBounds = {
    north: latitude + 0.1,
    south: latitude - 0.1,
    east: longitude + 0.1,
    west: longitude - 0.1,
  };

  const formatPlace = (place: google.maps.places.PlaceResult) => ({
    name: place.name ?? "",
    address: place.formatted_address ?? "",
    latitude: place.geometry?.location?.lat() ?? 0,
    longitude: place.geometry?.location?.lng() ?? 0,
    placeId: place.place_id ?? "",
    isAdded: false,
  });
  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    onPlaceSelect([formatPlace(place)]);
    setExpanded(false);
  };

  const handlePlaceQuery = (query: string) => {
    if (!query || !map || !placesLibrary) return;

    const service = new placesLibrary.PlacesService(map);

    const request: google.maps.places.TextSearchRequest = {
      query,
      location: new google.maps.LatLng(latitude, longitude),
      radius: 10000,
    };

    service.textSearch(request, (results, status) => {
      if (status === placesLibrary.PlacesServiceStatus.OK && results) {
        onPlaceSelect(results.map(formatPlace));
      } else {
        console.error("Place search failed:", status);
      }
    });
  };

  return (
    <div className="rounded-xl bg-surface">
      {expanded ? (
        <div className="w-70 relative">
          <button
            className="z-1 absolute -right-1 -top-2 bg-brand-primary p-1"
            onClick={() => setExpanded(false)}
          >
            <X size={16} />
          </button>
          <div className="flex flex-col gap-1">
            <LocationInput
              onPlaceSelect={handlePlaceSelect}
              onPlaceQuery={handlePlaceQuery}
              cityBounds={cityBounds}
            />
          </div>
        </div>
      ) : (
        <button
          className="btn-secondary bg-brand-secondary/20 p-2"
          onClick={() => setExpanded(true)}
        >
          <Search size={20} />
        </button>
      )}
    </div>
  );
}

export default function EventSearchConnected({
  destination,
}: {
  destination: { latitude: number; longitude: number };
}) {
  const map = useMap();
  const dispatch = useDispatch();

  const onPlaceSelect = (places: EventSearchResult[]) => {
    if (!map) return;
    fitToBounds({ map, events: places });
    dispatch(setSearchEvents(places));
  };

  return (
    <EventSearch onPlaceSelect={onPlaceSelect} destination={destination} />
  );
}
