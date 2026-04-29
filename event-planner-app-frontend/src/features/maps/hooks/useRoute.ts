import { useMap } from "@vis.gl/react-google-maps";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";

export default function useRoute() {
  const map = useMap();
  const { route } = useSelector((state: RootState) => state.map);
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();

  directionsRenderer.setMap(map);

  function calculateAndDisplayRoute() {
    if (!route) return;

    directionsService.route(
      {
        origin: { lat: route.from.latitude, lng: route.from.longitude },
        destination: { lat: route.to.latitude, lng: route.to.longitude },
        travelMode: route.mode as google.maps.TravelModeString,
      },
      (response, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(response);
        } else {
          console.error("error");
          // TODO: add notification
        }
      },
    );
  }

  return { calculateAndDisplayRoute };
}
