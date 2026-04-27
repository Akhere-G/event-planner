import { useState } from "react";
import type { EventSearchResult } from "../types";
import { Search, X } from "lucide-react";
import { LocationInput } from "../../../components";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { fitToBounds } from "../../maps/utils";
import { setSearchEvents } from "../../maps/service/mapSlice";
import { useDispatch, useSelector } from "react-redux";
import { searchTags } from "../../maps/constants";
import type { RootState } from "../../../store";

export function EventSearch({
  destination,
  onPlaceSelect,
}: {
  destination: { latitude: number; longitude: number };
  onPlaceSelect: (eventSearchResult: EventSearchResult[]) => void;
}) {
  const { latitude, longitude } = destination;

  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState<string | null>(null);

  const { searchEvents } = useSelector((state: RootState) => state.map);
  const dispatch = useDispatch();

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
    setQuery(query);
    const service = new placesLibrary.PlacesService(map);

    const bounds = map.getBounds();
    const request: google.maps.places.TextSearchRequest = {
      query,
      bounds,
    };

    service.textSearch(request, (results, status) => {
      if (status === placesLibrary.PlacesServiceStatus.OK && results) {
        onPlaceSelect(results.map(formatPlace));
      } else {
        console.error("Place search failed:", status);
      }
    });
  };

  if (query && searchEvents.length > 0) {
    return (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col gap-2 items-center ">
        <button
          className="z-1 absolute -right-3 -top-2 bg-brand-primary p-1 text-sm"
          onClick={() => {
            setQuery(null);
            dispatch(setSearchEvents([]));
          }}
        >
          <X size={16} />
        </button>
        <p className="bg-surface px-4 py-2 rounded-full text-sm">
          Searching: {query}
        </p>
        <button
          onClick={() => handlePlaceQuery(query)}
          className="btn-secondary px-6 py-2 text-xs"
        >
          Search here
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl absolute top-4 left-4">
      {expanded ? (
        <div className="max-w-[77vw] md:max-w-[40vw] relative">
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
            <div className="flex gap-2 overflow-x-scroll py-2 rounded-md">
              {searchTags.map(({ label, query, Icon }) => (
                <button
                  onClick={() => handlePlaceQuery(query)}
                  key={label}
                  className="btn-secondary px-3 py-2 text-xs flex gap-2 items-center w-full text-nowrap"
                >
                  <Icon size={16} />
                  <span className="flex-1">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-xl">
          <button
            className="btn-secondary bg-brand-secondary/20 p-2"
            onClick={() => setExpanded(true)}
          >
            <Search size={20} />
          </button>
        </div>
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
