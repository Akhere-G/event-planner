import { Map } from "@vis.gl/react-google-maps";
import {
  type MapCameraChangedEvent,
  type MapCameraProps,
} from "@vis.gl/react-google-maps";
import { useCallback, useState } from "react";

export default function TripMap({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const [cameraProps, setCameraProps] = useState<MapCameraProps>({
    center: { lat: latitude, lng: longitude },
    zoom: 12,
  });
  const handleCameraChange = useCallback(
    (ev: MapCameraChangedEvent) => setCameraProps(ev.detail),
    [],
  );
  return (
    <Map
      style={{ width: "100vw", height: "100vh" }}
      {...cameraProps}
      gestureHandling="greedy"
      disableDefaultUI
      onCameraChanged={handleCameraChange}
    />
  );
}
