import { useMap } from "@vis.gl/react-google-maps";
import { LocateIcon, Minus, Plus } from "lucide-react";
import { DEFAULT_ZOOM, MAX_ZOOM, MIN_ZOOM } from "../constants";

export function ZoomButtons({
  zoomToUser,
  zoomIn,
  zoomOut,
}: {
  zoomToUser: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}) {
  return (
    <>
      <div className="absolute bottom-4 right-2 flex flex-col gap-2">
        <button onClick={zoomToUser} className="p-2 btn-primary">
          <LocateIcon size={20} />
        </button>
        <button onClick={zoomIn} className="p-2 btn-primary">
          <Plus size={20} />
        </button>
        <button onClick={zoomOut} className="p-2 btn-primary">
          <Minus size={20} />
        </button>
      </div>
    </>
  );
}

export default function ZoomButtonsConnected({
  userCoords,
}: {
  userCoords: null | { latitude: number; longitude: number };
}) {
  const map = useMap();

  const zoomIn = () => {
    if (map)
      map.setZoom(Math.min((map.getZoom() || DEFAULT_ZOOM) + 1, MAX_ZOOM));
  };
  const zoomOut = () => {
    if (map)
      map.setZoom(Math.max((map.getZoom() || DEFAULT_ZOOM) - 1, MIN_ZOOM));
  };

  const zoomToUser = () => {
    if (!userCoords || !map) return;

    map.panTo({
      lat: userCoords?.latitude,
      lng: userCoords?.longitude,
    });
  };
  return (
    <ZoomButtons zoomIn={zoomIn} zoomOut={zoomOut} zoomToUser={zoomToUser} />
  );
}
