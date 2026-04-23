import { useState } from "react";
import {
  AdvancedMarker,
  InfoWindow,
  Pin,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import type { Event } from "../types";

interface EventMarkerProps {
  event: Event;
  position: google.maps.LatLngLiteral;
  onSelect: (event: Event) => void;
}

export default function EventMarker({
  event,
  position,
  onSelect,
}: EventMarkerProps) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [showInfo, setShowInfo] = useState(false);
  return (
    <AdvancedMarker
      ref={markerRef}
      position={position}
      onClick={() => onSelect(event)}
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
          <p className="text-xs font-bold text-brand-secondary whitespace-nowrap">
            {event.name}
          </p>
        </InfoWindow>
      )}

      <Pin
        background={"var(--color-brand-primary)"}
        glyphColor={"var(--color-text-inverse)"}
        borderColor={"var(--color-surface-border)"}
      />
    </AdvancedMarker>
  );
}
