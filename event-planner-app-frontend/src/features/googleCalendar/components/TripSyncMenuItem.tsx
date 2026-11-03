import { CalendarSync } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenuItem } from "../../../components/ui/dropdown-menu";
import {
  useDisableTripSyncMutation,
  useEnableTripSyncMutation,
  useGetCalendarStatusQuery,
} from "../googleCalendarApiSlice";
import { apiErrorMessage, isTripSynced, tripSyncLabel } from "../utils";

interface TripSyncMenuItemProps {
  tripId: number;
}

export default function TripSyncMenuItem({ tripId }: TripSyncMenuItemProps) {
  const { data } = useGetCalendarStatusQuery();
  const [enable, { isLoading: isEnabling }] = useEnableTripSyncMutation();
  const [disable, { isLoading: isDisabling }] = useDisableTripSyncMutation();

  const status = data?.data;
  const synced = isTripSynced(status, tripId);

  const handleToggle = async () => {
    try {
      if (synced) {
        await disable({ tripId }).unwrap();
        toast.success("Stopped syncing with Google Calendar.");
      } else {
        await enable({ tripId }).unwrap();
        toast.success("Syncing with Google Calendar.");
      }
    } catch (err) {
      toast.error(
        apiErrorMessage(err, "Could not update Google Calendar sync."),
      );
    }
  };

  return (
    <DropdownMenuItem
      disabled={!status?.connected || isEnabling || isDisabling}
      onClick={handleToggle}
      className="flex gap-2 items-center"
    >
      <CalendarSync size={16} />
      {tripSyncLabel(status, tripId)}
    </DropdownMenuItem>
  );
}
