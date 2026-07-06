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
}

// TODO: When clicked, a wishList item card should be displayed in the map , similiar to how ehrn the event markers are clicked, an event card pops up

export default function WishlistMarker({
  item,
  position,
  color,
}: WishlistMarkerProps) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [showInfo, setShowInfo] = useState(false);

  return (
    <AdvancedMarker
      ref={markerRef}
      position={position}
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
          <div className="text-xs max-w-40">
            <p
              style={{ color }}
              className="font-bold whitespace-nowrap truncate"
            >
              {item.name}
            </p>
            {item.address && (
              <p className="text-text-secondary text-[10px] truncate">
                {item.address}
              </p>
            )}
          </div>
        </InfoWindow>
      )}

      <Pin
        background={color}
        glyphSrc="/wishlist_star.svg"
        glyphColor={"var(--color-text-inverse)"}
        borderColor={"var(--color-surface-border)"}
        scale={0.9}
      />
    </AdvancedMarker>
  );
}
