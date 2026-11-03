import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import { StateGate } from "../../../components";
import {
  useDisconnectCalendarMutation,
  useGetCalendarStatusQuery,
  useStartCalendarConnectMutation,
} from "../googleCalendarApiSlice";
import {
  apiErrorMessage,
  CONNECT_RESULT_PARAM,
  connectResultMessage,
} from "../utils";

export default function GoogleCalendarSettings() {
  const { data, isLoading, isError } = useGetCalendarStatusQuery();
  const [startConnect, { isLoading: isConnecting }] =
    useStartCalendarConnectMutation();
  const [disconnect, { isLoading: isDisconnecting }] =
    useDisconnectCalendarMutation();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const message = connectResultMessage(
      searchParams.get(CONNECT_RESULT_PARAM),
    );
    if (!message) return;
    toast.success(message);
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleConnect = async () => {
    try {
      const { data: link } = await startConnect().unwrap();
      window.location.assign(link.url);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not start Google sign-in."));
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect().unwrap();
      toast.success("Google Calendar disconnected.");
    } catch (err) {
      toast.error(
        apiErrorMessage(err, "Could not disconnect Google Calendar."),
      );
    }
  };

  const connected = !!data?.data.connected;

  return (
    <StateGate
      loadingStateProps={{ isLoading, message: "Loading calendar status..." }}
      errorStateProps={{
        isError,
        message: "Failed to load Google Calendar status",
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-text-sub">
          {connected
            ? "Connected. Turn on syncing for a trip from its menu."
            : "Sync trip events and flights with a dedicated Google calendar."}
        </p>
        {connected ? (
          <button
            aria-label="Disconnect Google Calendar"
            className="btn-secondary"
            disabled={isDisconnecting}
            onClick={handleDisconnect}
          >
            Disconnect
          </button>
        ) : (
          <button
            aria-label="Connect Google Calendar"
            className="btn-primary"
            disabled={isConnecting}
            onClick={handleConnect}
          >
            Connect Google Calendar
          </button>
        )}
      </div>
    </StateGate>
  );
}
