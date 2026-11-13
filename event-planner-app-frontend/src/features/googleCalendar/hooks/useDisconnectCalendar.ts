import { toast } from "sonner";
import { isApiError } from "../../api/utils";
import { useDisconnectCalendarMutation } from "../services/googleCalendarApiSlice";

/** Disconnects Google Calendar and tells the user how it went. */
export default function useDisconnectCalendar() {
  const [disconnectCalendar, { isLoading }] = useDisconnectCalendarMutation();

  const disconnect = async () => {
    try {
      await disconnectCalendar().unwrap();
      toast.success("Google Calendar disconnected.");
    } catch (err) {
      toast.error(
        isApiError(err)
          ? err.data.message
          : "Could not disconnect Google Calendar.",
      );
    }
  };

  return { disconnect, isDisconnecting: isLoading };
}
