import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useMemo, useState } from "react";
import type { Route } from "../types";
import { Circle, MapPin, X } from "lucide-react";
import { setRoutes } from "../service/mapSlice";
import type { RootState } from "../../../store";
import { useDispatch, useSelector } from "react-redux";

export default function RouteDetails() {
  const { routes } = useSelector((state: RootState) => state.map);
  const dispatch = useDispatch();

  if (!routes || routes.length === 0) return null;

  return (
    <>
      <div className="fixed top-16 md:top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
        <button
          className="z-20 absolute -right-3 -top-2 bg-brand-primary p-1 shadow-md rounded-full text-white"
          onClick={() => dispatch(setRoutes(null))}
        >
          <X size={16} />
        </button>

        <div className="flex flex-col gap-1">
          {routes.map((route, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <p className="bg-surface px-4 py-2 rounded-full text-xs md:text-sm flex gap-2 items-center shadow-md whitespace-nowrap">
                {idx === 0 ? (
                  <Circle size={14} />
                ) : (
                  <MapPin size={14} className="text-brand-primary" />
                )}
                {route.from.name}
              </p>
              <div className="border-r-2 border-dashed h-3 border-brand-primary/40"></div>
              {idx === routes.length - 1 && (
                <p className="bg-surface px-4 py-2 rounded-full text-xs md:text-sm flex gap-2 items-center shadow-md whitespace-nowrap">
                  <MapPin size={14} className="text-brand-primary" />
                  {route.to.name}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {routes.map((route, index) => (
        <DirectionsLeg key={index} route={route} />
      ))}
    </>
  );
}

function DirectionsLeg({ route }: { route: Route }) {
  const map = useMap();
  const routesLib = useMapsLibrary("routes");
  const [, setResponse] = useState<google.maps.DirectionsResult | null>(null);

  const directionsRenderer = useMemo(() => {
    if (!routesLib) return null;
    return new routesLib.DirectionsRenderer({
      suppressMarkers: true,
      preserveViewport: true,
    });
  }, [routesLib]);

  useEffect(() => {
    if (!routesLib || !map || !directionsRenderer) return;

    const service = new routesLib.DirectionsService();

    service.route(
      {
        origin: { lat: route.from.latitude, lng: route.from.longitude },
        destination: { lat: route.to.latitude, lng: route.to.longitude },
        travelMode: route.mode as google.maps.TravelMode,
      },
      (result, status) => {
        if (status === "OK" && result) {
          directionsRenderer.setMap(map);
          directionsRenderer.setDirections(result);
          setResponse(result);
        }
      },
    );

    return () => directionsRenderer.setMap(null);
  }, [route, map, routesLib, directionsRenderer]);

  return null;
}
