import { memo, useState } from "react";
import {
  AdvancedMarker,
  InfoWindow,
  Pin,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import type { EventSearchResult } from "../types";

interface EventSearchMarkerProps {
  place: EventSearchResult;
  onSelect: (event: EventSearchResult) => void;
}

const EventSearchMarker = memo(
  ({ place, onSelect }: EventSearchMarkerProps) => {
    const [markerRef, marker] = useAdvancedMarkerRef();
    const [showInfo, setShowInfo] = useState(false);

    const { name, latitude, longitude } = place;
    return (
      <AdvancedMarker
        ref={markerRef}
        position={{
          lat: latitude,
          lng: longitude,
        }}
        onClick={() => onSelect(place)}
        onMouseEnter={() => setShowInfo(true)}
        onMouseLeave={() => setShowInfo(false)}
      >
        {showInfo && (
          <InfoWindow
            anchor={marker}
            onCloseClick={() => setShowInfo(false)}
            disableAutoPan
            headerDisabled
          >
            <p className="text-xs font-bold text-brand-primary whitespace-nowrap">
              {name}
            </p>
          </InfoWindow>
        )}

        <Pin
          background={"var(--color-surface)"}
          glyphColor={"var(--color-text-inverse)"}
          borderColor={"var(--color-surface-border)"}
        />
      </AdvancedMarker>
    );
  },
);

export default EventSearchMarker;
