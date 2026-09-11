import { memo, useState } from "react";
import {
  AdvancedMarker,
  InfoWindow,
  Pin,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import type { Event } from "../../events/types";
import { getDayColor } from "../../events/utils";

interface EventMarkerProps {
  event: Event;
  position: google.maps.LatLngLiteral;
  onSelect: (event: Event) => void;
  day: number;
  selected: boolean;
  isRouteStart: boolean;
  isRouteEnd: boolean;
}

const EventMarker = memo(
  ({
    event,
    position,
    day,
    onSelect,
    selected,
    isRouteStart,
    isRouteEnd,
  }: EventMarkerProps) => {
    const [markerRef, marker] = useAdvancedMarkerRef();
    const [showInfo, setShowInfo] = useState(false);

    const eventColor = getDayColor(day - 1);

    const isRoutePin = isRouteStart || isRouteEnd;
    let pinIcon: string | undefined = undefined;
    if (isRouteStart) {
      pinIcon = "/map_to_icon.svg";
    } else if (isRouteEnd) {
      pinIcon = "/flag.svg";
    }
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
            <p
              style={{ color: eventColor }}
              className="text-xs font-bold t whitespace-nowrap"
            >
              {event.name}
            </p>
          </InfoWindow>
        )}

        <Pin
          background={eventColor}
          glyphText={isRoutePin ? undefined : String(day)}
          glyphSrc={pinIcon}
          glyphColor={isRouteEnd ? undefined : "var(--color-text-inverse)"}
          borderColor={"var(--color-surface-border)"}
          scale={selected ? 1.5 : 1}
        />
      </AdvancedMarker>
    );
  },
);

export default EventMarker;
