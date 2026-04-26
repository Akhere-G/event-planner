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
}

const EventMarker = memo(
  ({ event, position, day, onSelect }: EventMarkerProps) => {
    const [markerRef, marker] = useAdvancedMarkerRef();
    const [showInfo, setShowInfo] = useState(false);

    const eventColor = getDayColor(day);

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
          glyphColor={"var(--color-text-inverse)"}
          borderColor={"var(--color-surface-border)"}
          glyphText={day.toString()}
        />
      </AdvancedMarker>
    );
  },
);

export default EventMarker;
