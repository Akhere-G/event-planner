import { useMap } from "@vis.gl/react-google-maps";
import { Home, LocateIcon, Minus, Plus } from "lucide-react";
import { DEFAULT_ZOOM, MAX_ZOOM, MIN_ZOOM } from "../constants";
import { useGetAccommodationsQuery } from "../../accommodations/apiSlice";
import { useParams } from "react-router";
import { fitToBounds } from "../utils";
import { useGetTripQuery } from "../../trips/services/tripsApiSlice";

export function ZoomButtons({
  zoomToUser,
  zoomHome,
  zoomIn,
  zoomOut,
}: {
  zoomToUser: () => void;
  zoomHome: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}) {
  return (
    <>
      <div className="absolute bottom-4 right-2 flex flex-col gap-2">
        <button onClick={zoomToUser} className="p-2 btn-primary">
          <LocateIcon size={20} />
        </button>
        <button onClick={zoomHome} className="p-2 btn-primary">
          <Home size={20} />
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
  const params = useParams();
  const tripId = Number(params.tripId);

  const { data } = useGetAccommodationsQuery(tripId);
  const { data: tripData } = useGetTripQuery(tripId);

  const trip = tripData?.data;

  const accommodations = data?.data ?? [];
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

  const zoomHome = () => {
    if (map) fitToBounds({ map, events: accommodations, defaultCenter: trip });
  };

  return (
    <ZoomButtons
      zoomIn={zoomIn}
      zoomOut={zoomOut}
      zoomToUser={zoomToUser}
      zoomHome={zoomHome}
    />
  );
}
