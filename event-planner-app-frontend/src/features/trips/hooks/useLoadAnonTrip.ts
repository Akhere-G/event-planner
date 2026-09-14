import { useEffect, useState } from "react";
import { anonymousAccessCodeStorageKey } from "../../api/apiSlice";
import type { AnonTrip } from "../types";
import { usePostHog } from "@posthog/react";

export default function useLoadAnonTrip() {
  const [anonTrip, setAnonTrip] = useState<null | AnonTrip>();
  const posthog = usePostHog();
  useEffect(() => {
    function loadAnonKey() {
      const anonTrip = localStorage.getItem(anonymousAccessCodeStorageKey);
      if (anonTrip) {
        try {
          setAnonTrip(JSON.parse(anonTrip));
        } catch (err) {
          posthog?.captureException(err, {
            feature: "failed_load_anon_trip",
            action: "failed_load_anon_trip",
          });
        }
      }
    }
    loadAnonKey();
  }, [posthog]);

  function clearAnonTrip() {
    localStorage.removeItem(anonymousAccessCodeStorageKey);
    setAnonTrip(null);
  }

  return { anonTrip, clearAnonTrip };
}
