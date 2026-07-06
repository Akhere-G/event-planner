import { useState } from "react";
import {
  AdvancedMarker,
  InfoWindow,
  Pin,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import type { WishlistItem } from "../../wishlist/types";

interface WishlistMarkerProps {
  item: WishlistItem;
  position: google.maps.LatLngLiteral;
  color: string;
  selected: boolean;
  onSelect: (item: WishlistItem) => void;
}

// TODO: When clicked, a wishList item card should be displayed in the map , similiar to how ehrn the event markers are clicked, an event card pops up

export default function WishlistMarker({
  item,
  position,
  color,
  selected,
  onSelect,
}: WishlistMarkerProps) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [showInfo, setShowInfo] = useState(false);

  return (
    <AdvancedMarker
      ref={markerRef}
      position={position}
      onMouseEnter={() => setShowInfo(true)}
      onMouseLeave={() => setShowInfo(false)}
      onClick={() => onSelect(item)}
    >
      {showInfo && (
        <InfoWindow
          anchor={marker}
          onCloseClick={() => setShowInfo(false)}
          disableAutoPan
          headerDisabled
        >
          <div className="text-sm max-w-50">
            <p style={{ color }} className="font-bold">
              {item.name}
            </p>
          </div>
        </InfoWindow>
      )}

      <Pin
        background={color}
        glyphSrc="/wishlist_star.svg"
        glyphColor={"var(--color-text-inverse)"}
        borderColor={"var(--color-surface-border)"}
        scale={selected ? 1.4 : 0.9}
      />
    </AdvancedMarker>
  );
}
