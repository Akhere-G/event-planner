import { AdvancedMarker, Map, Pin } from "@vis.gl/react-google-maps";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { getDayColor } from "../../events/utils";
import { DEFAULT_ZOOM, MAX_ZOOM, MIN_ZOOM } from "../../maps/constants";
import type { TemplateDetail } from "../types";

export default function TemplateMap({ template }: { template: TemplateDetail }) {
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);

  return (
    <div className="w-full h-80 md:h-full min-h-80 md:rounded-md overflow-hidden">
      <Map
        mapId="e74fd7bd6c063337caf66343"
        maxZoom={MAX_ZOOM}
        minZoom={MIN_ZOOM}
        className="w-full h-full"
        defaultCenter={{ lat: template.latitude, lng: template.longitude }}
        defaultZoom={DEFAULT_ZOOM}
        disableDefaultUI
        colorScheme={darkMode ? "DARK" : "LIGHT"}
        gestureHandling="cooperative"
      >
        {template.days.flatMap((day) =>
          day.events.map((event, i) => (
            <AdvancedMarker
              key={`${day.dayOffset}-${i}`}
              position={{ lat: event.latitude, lng: event.longitude }}
              title={event.name}
            >
              <Pin background={getDayColor(day.dayOffset)} />
            </AdvancedMarker>
          )),
        )}
        {template.accommodations.map((stay, i) => (
          <AdvancedMarker
            key={`stay-${i}`}
            position={{ lat: stay.latitude, lng: stay.longitude }}
            title={stay.name}
          >
            <Pin background="#4b5563" />
          </AdvancedMarker>
        ))}
      </Map>
    </div>
  );
}
