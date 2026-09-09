import {
  AdvancedMarker,
  InfoWindow,
  Pin,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import type { Accommodation } from "../../accommodations/types";
import { useState } from "react";

export default function AccommodationMarker({
  accommodation,
  onSelect,
  isSelected,
}: {
  accommodation: Accommodation;
  onSelect: (accommodation: Accommodation) => void;
  isSelected: boolean;
}) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [showInfo, setShowInfo] = useState(false);

  return (
    <AdvancedMarker
      ref={markerRef}
      position={{ lat: accommodation.latitude, lng: accommodation.longitude }}
      onMouseEnter={() => setShowInfo(true)}
      onMouseLeave={() => setShowInfo(false)}
      onClick={() => onSelect(accommodation)}
    >
      {showInfo && (
        <InfoWindow
          anchor={marker}
          onCloseClick={() => setShowInfo(false)}
          disableAutoPan
          headerDisabled
        >
          <p className="text-xs font-bold t whitespace-nowrap">
            {accommodation.name}
          </p>
        </InfoWindow>
      )}

      <Pin
        background={"var(--color-brand-primary)"}
        glyphSrc={"/app/house.svg"}
        glyphColor={"var(--color-text-inverse)"}
        borderColor={"var(--color-surface-border)"}
        scale={isSelected ? 1.3 : 1}
      />
    </AdvancedMarker>
  );
}
