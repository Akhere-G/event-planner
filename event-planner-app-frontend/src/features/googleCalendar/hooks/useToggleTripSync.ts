import { toast } from "sonner";
import { isApiError } from "../../api/utils";
import {
  useDisableTripSyncMutation,
  useEnableTripSyncMutation,
} from "../services/googleCalendarApiSlice";

/** Switches a trip's Google Calendar sync on or off and tells the user how it went. */
export default function useToggleTripSync(tripId: number) {
  const [enableTripSync, { isLoading: isEnabling }] =
    useEnableTripSyncMutation();
  const [disableTripSync, { isLoading: isDisabling }] =
    useDisableTripSyncMutation();

  const toggle = async (synced: boolean) => {
    try {
      if (synced) {
        await disableTripSync(tripId).unwrap();
        toast.success("Stopped syncing this trip to Google Calendar.");
      } else {
        await enableTripSync(tripId).unwrap();
        toast.success("Syncing this trip to Google Calendar.");
      }
    } catch (err) {
      toast.error(
        isApiError(err)
          ? err.data.message
          : "Could not update Google Calendar sync.",
      );
    }
  };

  return { toggle, isToggling: isEnabling || isDisabling };
}
