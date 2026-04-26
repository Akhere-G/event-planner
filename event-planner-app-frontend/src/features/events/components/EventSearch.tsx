import { useState } from "react";
import type { Event, EventSearchResult } from "../types";
import { Search, X } from "lucide-react";
import { LocationInput } from "../../../components";

export type Day = {
  date: string;
  events: Event[];
  day: number;
  show: boolean;
};

export default function EventSearch({
  destination,
  onPlaceSelect,
}: {
  destination: { latitude: number; longitude: number };
  onPlaceSelect: (eventSearchResult: EventSearchResult[]) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const { latitude, longitude } = destination;

  const cityBounds = {
    north: latitude + 0.1,
    south: latitude - 0.1,
    east: longitude + 0.1,
    west: longitude - 0.1,
  };

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    onPlaceSelect([
      {
        name: place.name ?? "",
        address: place.formatted_address ?? "",
        latitude: place.geometry?.location?.lat() ?? 0,
        longitude: place.geometry?.location?.lng() ?? 0,
        placeId: place.place_id ?? "",
        isAdded: false,
      },
    ]);
    setExpanded(false);
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
