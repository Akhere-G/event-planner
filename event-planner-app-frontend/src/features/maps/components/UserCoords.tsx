import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

const permissionEnum = {
  GRANTED: "GRANTED",
  DENIED: "DENIED",
  LOADING: "LOADING",
} as const;

export default function UserCoords() {
  const [userCoords, setUserCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [, setPermission] = useState<keyof typeof permissionEnum>(
    permissionEnum.LOADING,
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserCoords(position.coords);
        setPermission(permissionEnum.GRANTED);
      },
      (error) => {
        console.error(error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            return toast.error("Location denied!");
          case error.POSITION_UNAVAILABLE:
            return toast.error("Could not get location!");
        }
        setPermission(permissionEnum.DENIED);
      },
      { enableHighAccuracy: true },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [dispatch]);

  if (!userCoords) return null;

  return (
    <AdvancedMarker
      position={{ lat: userCoords.latitude, lng: userCoords.longitude }}
    >
      <div className="w-6 h-6 rounded-full bg-blue-400/70 flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
        </div>
      </div>
    </AdvancedMarker>
  );
}
