import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { setRoute } from "../service/mapSlice";
import { Circle, Loader2, MapPin, X } from "lucide-react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useMemo, useState } from "react";

export default function RouteDetails() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasDirections, setHasDirections] = useState(false);

  const { route } = useSelector((state: RootState) => state.map);
  const dispatch = useDispatch();

  const map = useMap();
  const routesLib = useMapsLibrary("routes");

  // Initialize the renderer and service only when the library is ready
  const { directionsService, directionsRenderer } = useMemo(() => {
    if (!routesLib)
      return { directionsService: null, directionsRenderer: null };
    return {
      directionsService: new routesLib.DirectionsService(),
      directionsRenderer: new routesLib.DirectionsRenderer({
        preserveViewport: false,
        suppressMarkers: false,
      }),
    };
  }, [routesLib]);

  useEffect(() => {
    setIsLoading(true);
    setHasDirections(false);
    const getDirections = async () => {
      try {
        if (!directionsRenderer || !directionsService || !map) return;

        if (!route) {
          directionsRenderer.setDirections(null);
          directionsRenderer.setMap(null);
          return;
        }

        directionsRenderer.setMap(map);
        await directionsService.route(
          {
            origin: { lat: route.from.latitude, lng: route.from.longitude },
            destination: { lat: route.to.latitude, lng: route.to.longitude },
            travelMode: route.mode as google.maps.TravelMode,
          },
          (result, status) => {
            if (status === "OK") {
              console.log("result", result);
              directionsRenderer.setDirections(result);
              setHasDirections(true);
            } else {
              dispatch(setRoute(null));
            }
          },
        );
      } catch (err) {
        console.error(err);

        // TODO: send notification
      } finally {
        setIsLoading(false);
      }
    };
    getDirections();
    return () => {
      directionsRenderer?.setDirections(null);
      directionsRenderer?.setMap(null);
    };
  }, [route, map, directionsService, directionsRenderer, dispatch]);

  console.log(isLoading);
  if (isLoading) {
    console.log("loading");
    return (
      <div className="fixed top-16 md:top-4 left-1/2 -translate-x-1/2 z-1">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }
  if (route && hasDirections) {
    return (
      <div className="fixed top-16 md:top-4 left-1/2 -translate-x-1/2  z-1 ">
        <button
          className="z-1 absolute -right-3 -top-2 bg-brand-primary p-1 shadow-md"
          onClick={() => {
            dispatch(setRoute(null));
          }}
        >
          <X size={16} />
        </button>
        <div>
          <p className="bg-surface px-4 py-2 rounded-full text-xs md:text-sm flex gap-2 items-center shadow-md">
            <Circle size={16} />
            {route.from.name}
          </p>
          <div className="border-r-2 ml-5 border-dashed h-4 w-1"></div>
          <p className="bg-surface px-4 py-2 rounded-full text-xs md:text-sm flex gap-2 items-center shadow-md">
            <MapPin className="text-brand-primary" size={16} />
            {route.to.name}
          </p>
        </div>
      </div>
    );
  }
  return null;
}
