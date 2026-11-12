import { AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { getDayColor } from "../../events/utils";
import type { TemplateDetail } from "../types";
import TemplateMapCanvas from "./TemplateMapCanvas";

interface MapPoint {
  key: string;
  title: string;
  latitude: number;
  longitude: number;
  color: string;
  glyph?: string;
}

const STAY_COLOR = "var(--color-brand-primary)";
const WISHLIST_COLOR = "var(--color-text-secondary)";

function collectPoints({
  days,
  accommodations,
  wishlistItems,
}: TemplateDetail): MapPoint[] {
  const points: MapPoint[] = [];
  for (const day of days) {
    for (const [index, event] of day.events.entries()) {
      points.push({
        key: `event-${day.dayOffset}-${index}`,
        title: event.name,
        latitude: event.latitude,
        longitude: event.longitude,
        color: getDayColor(day.dayOffset),
        glyph: String(day.dayOffset + 1),
      });
    }
  }
  for (const [index, stay] of accommodations.entries()) {
    points.push({
      key: `stay-${index}`,
      title: stay.name,
      latitude: stay.latitude,
      longitude: stay.longitude,
      color: STAY_COLOR,
      glyph: "S",
    });
  }
  for (const [index, item] of wishlistItems.entries()) {
    if (item.latitude !== null && item.longitude !== null) {
      points.push({
        key: `wishlist-${index}`,
        title: item.name,
        latitude: item.latitude,
        longitude: item.longitude,
        color: WISHLIST_COLOR,
      });
    }
  }
  return points;
}

export default function TemplateDetailMap({
  template,
}: {
  template: TemplateDetail;
}) {
  const points = collectPoints(template);

  return (
    <TemplateMapCanvas points={points}>
      {points.map((point) => (
        <AdvancedMarker
          key={point.key}
          position={{ lat: point.latitude, lng: point.longitude }}
          title={point.title}
        >
          <Pin
            background={point.color}
            borderColor="#ffffff"
            glyphColor="#ffffff"
            glyphText={point.glyph}
          />
        </AdvancedMarker>
      ))}
    </TemplateMapCanvas>
  );
}
