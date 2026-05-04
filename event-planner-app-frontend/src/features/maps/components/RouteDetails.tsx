import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { setRouteIndex, setRoutes } from "../service/mapSlice";
import { useEffect, useState, useCallback } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import RouteCarousel from "./RouteCarousel";
import DirectionsRenderer from "./DirectionsLeg";
import type { Route } from "../types";

export default function RouteDetails() {
  const { routes, currentRouteIndex } = useSelector(
    (state: RootState) => state.map,
  );
  const dispatch = useDispatch();

  const map = useMap();
  const routesLib = useMapsLibrary("routes");

  const [legResults, setLegResults] = useState<
    (google.maps.DirectionsResult | null)[]
  >([]);

  const fetchRoute = useCallback(
    async (service: google.maps.DirectionsService, route: Route) => {
      return new Promise<google.maps.DirectionsResult | null>((resolve) => {
        service.route(
          {
            origin: { lat: route.from.latitude, lng: route.from.longitude },
            destination: { lat: route.to.latitude, lng: route.to.longitude },
            travelMode: route.mode as google.maps.TravelMode,
          },
          (result, status) => {
            if (status === "OK") resolve(result);
            else resolve(null);
          },
        );
      });
    },
    [],
  );

  useEffect(() => {
    return () => {
      dispatch(setRoutes(null));
    };
  }, [dispatch]);

  useEffect(() => {
    if (!routes || !routesLib || !map) return;

    const service = new routesLib.DirectionsService();

    const fetchAll = async () => {
      const results = await Promise.all(
        routes.map((r) => fetchRoute(service, r)),
      );
      setLegResults(results);
    };

    fetchAll();
  }, [routes, routesLib, map, fetchRoute, dispatch]);

  const handleUpdateMode = (index: number, mode: string) => {
    const updatedRoutes = [...routes!];
    updatedRoutes[index] = { ...updatedRoutes[index], mode: mode };
    dispatch(setRoutes(updatedRoutes));
  };

  if (!routes || routes.length === 0) return null;

  return (
    <>
      {legResults.map(
        (result, index) =>
          result &&
          index === currentRouteIndex && (
            <DirectionsRenderer
              key={index}
              result={result}
              preserveViewport={legResults.length > 1}
            />
          ),
      )}

      <RouteCarousel
        routes={routes}
        legResults={legResults}
        onClose={() => dispatch(setRoutes(null))}
        onUpdateMode={handleUpdateMode}
        activeIndex={currentRouteIndex}
        setActiveIndex={(index) => dispatch(setRouteIndex(index))}
      />
    </>
  );
}
