import { Map, useMap } from "@vis.gl/react-google-maps";
import { useEffect, type ReactNode } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { MAX_ZOOM } from "../../maps/constants";
import { fitToBounds } from "../../maps/utils";

const MAP_ID = "e74fd7bd6c063337caf66343";
const WORLD_CENTER = { lat: 30, lng: 10 };
const FIT_PADDING = 60;
const WORLD_RESTRICTION: google.maps.MapRestriction = {
  latLngBounds: { north: 85, south: -85, west: -180, east: 180 },
  strictBounds: true,
};

interface Point {
  latitude: number;
  longitude: number;
}

function FitToPoints({ points }: { points: Point[] }) {
  const map = useMap();

  useEffect(() => {
    if (map) {
      fitToBounds({ map, events: points, padding: FIT_PADDING });
    }
  }, [map, points]);

  return null;
}

interface TemplateMapCanvasProps {
  points: Point[];
  children: ReactNode;
}

export default function TemplateMapCanvas({
  points,
  children,
}: TemplateMapCanvasProps) {
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);

  return (
    <div className="w-full h-full min-h-72">
      <Map
        mapId={MAP_ID}
        minZoom={2}
        restriction={WORLD_RESTRICTION}
        maxZoom={MAX_ZOOM}
        className="w-full h-full"
        defaultCenter={WORLD_CENTER}
        defaultZoom={2}
        disableDefaultUI
        colorScheme={darkMode ? "DARK" : "LIGHT"}
        gestureHandling="greedy"
      >
        <FitToPoints points={points} />
        {children}
      </Map>
    </div>
  );
}
