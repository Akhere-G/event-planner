import { useState } from "react";
import { Link } from "react-router";
import { AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps";
import type { TemplatePin } from "../types";
import TemplateMapCanvas from "./TemplateMapCanvas";

export default function TemplatePinsMap({ pins }: { pins: TemplatePin[] }) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const selected = pins.find((pin) => pin.slug === selectedSlug);

  return (
    <TemplateMapCanvas points={pins}>
      {pins.map((pin) => (
        <AdvancedMarker
          key={pin.slug}
          position={{ lat: pin.latitude, lng: pin.longitude }}
          title={pin.title}
          onClick={() => setSelectedSlug(pin.slug)}
        />
      ))}
      {selected && (
        <InfoWindow
          position={{ lat: selected.latitude, lng: selected.longitude }}
          pixelOffset={[0, -40]}
          onCloseClick={() => setSelectedSlug(null)}
          headerContent={<strong>{selected.destination}</strong>}
        >
          <div className="flex flex-col gap-1 text-black">
            <span>{selected.title}</span>
            <Link to={`/templates/${selected.slug}`}>View itinerary</Link>
          </div>
        </InfoWindow>
      )}
    </TemplateMapCanvas>
  );
}
