import { useState } from "react";
import {
  AdvancedMarker,
  InfoWindow,
  Pin,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import type { EventSearchResult } from "../types";
import { setSearchIndex } from "../service/mapSlice";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../store";

interface EventSearchMarkerProps {
  event: EventSearchResult;
  onSelect: (event: EventSearchResult) => void;
  scale: number;
}

const EventSearchMarker = ({
  event,
  onSelect,
  scale,
}: EventSearchMarkerProps) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [showInfo, setShowInfo] = useState(false);

  const { name, latitude, longitude } = event;
  return (
    <AdvancedMarker
      ref={markerRef}
      position={{
        lat: latitude,
        lng: longitude,
      }}
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
          <p className="text-xs font-bold text-brand-primary whitespace-nowrap">
            {name}
          </p>
        </InfoWindow>
      )}

      <Pin
        background={"var(--color-brand-primary)"}
        glyphColor={"var(--color-text-inverse)"}
        borderColor={"var(--color-surface-border)"}
        scale={scale}
      />
    </AdvancedMarker>
  );
};

export default function EventSearchMarkerConnected({
  event,
}: {
  event: EventSearchResult;
}) {
  const { searchEvents, searchIndex } = useSelector(
    (state: RootState) => state.map,
  );

  const dispatch = useDispatch();

  const onSelectSearchMarker = (event: EventSearchResult) => {
    const index = searchEvents.findIndex((e) => e.placeId === event.placeId);
    if (index === -1) return;
    dispatch(setSearchIndex(index));
  };

  const currentEvent = searchEvents[searchIndex];

  const isCurrent = currentEvent.placeId === event.placeId;

  return (
    <EventSearchMarker
      key={event.placeId}
      event={event}
      onSelect={onSelectSearchMarker}
      scale={isCurrent ? 1.5 : 1}
    />
  );
}
