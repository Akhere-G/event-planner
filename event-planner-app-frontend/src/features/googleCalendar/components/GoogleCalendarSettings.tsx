import { StateGate } from "../../../components";
import useConnectCalendar from "../hooks/useConnectCalendar";
import useConnectResultToast from "../hooks/useConnectResultToast";
import useDisconnectCalendar from "../hooks/useDisconnectCalendar";
import { useGetCalendarStatusQuery } from "../services/googleCalendarApiSlice";

export default function GoogleCalendarSettings() {
  useConnectResultToast();
  const { data, isLoading, isError } = useGetCalendarStatusQuery();
  const { connect, isConnecting } = useConnectCalendar();
  const { disconnect, isDisconnecting } = useDisconnectCalendar();
  const status = data?.data;

  return (
    <StateGate
      loadingStateProps={{ isLoading, message: "Checking Google Calendar..." }}
      errorStateProps={{
        isError,
        message: "Failed to load Google Calendar status.",
      }}
    >
      {status && (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-text-secondary">
            {status.connected
              ? "Connected. Choose Sync to Google Calendar from a trip's menu to keep its events and flights in step with Google."
              : "Connect your Google account to keep a trip's events and flights in step with a Google calendar."}
          </p>
          {status.connected ? (
            <button
              className="btn-secondary"
              disabled={isDisconnecting}
              onClick={disconnect}
            >
              Disconnect
            </button>
          ) : (
            <button
              className="btn-primary"
              disabled={isConnecting}
              onClick={connect}
            >
              Connect Google Calendar
            </button>
          )}
        </div>
      )}
    </StateGate>
  );
}
