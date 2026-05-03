import { useMap } from "@vis.gl/react-google-maps";
import { useEffect, useMemo } from "react";

export default function DirectionsRenderer({
  result,
  preserveViewport,
}: {
  result: google.maps.DirectionsResult;
  preserveViewport: boolean;
}) {
  const map = useMap();
  const renderer = useMemo(
    () =>
      new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        preserveViewport,
        polylineOptions: { strokeColor: "#2563eb", strokeWeight: 5 },
      }),
    [preserveViewport],
  );

  useEffect(() => {
    renderer.setMap(map);
    renderer.setDirections(result);
    return () => renderer.setMap(null);
  }, [map, result, renderer]);

  return null;
}
