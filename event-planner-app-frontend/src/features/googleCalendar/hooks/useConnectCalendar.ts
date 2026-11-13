import { toast } from "sonner";
import { isApiError } from "../../api/utils";
import { useConnectCalendarMutation } from "../services/googleCalendarApiSlice";

/** Sends the user to Google's consent page; failures are reported with a toast. */
export default function useConnectCalendar() {
  const [connectCalendar, { isLoading }] = useConnectCalendarMutation();

  const connect = async () => {
    try {
      const { data } = await connectCalendar().unwrap();
      window.location.assign(data.url);
    } catch (err) {
      toast.error(
        isApiError(err) ? err.data.message : "Could not reach Google Calendar.",
      );
    }
  };

  return { connect, isConnecting: isLoading };
}
