import { CalendarSync } from "lucide-react";
import { DropdownMenuItem } from "../../../components/ui/dropdown-menu";
import useToggleTripSync from "../hooks/useToggleTripSync";
import { useGetCalendarStatusQuery } from "../services/googleCalendarApiSlice";
import { isTripSynced, tripSyncLabel } from "../utils";

interface TripSyncMenuItemProps {
  tripId: number;
}

export default function TripSyncMenuItem({ tripId }: TripSyncMenuItemProps) {
  const { data } = useGetCalendarStatusQuery();
  const { toggle, isToggling } = useToggleTripSync(tripId);
  const status = data?.data;
  const synced = isTripSynced(status, tripId);

  return (
    <DropdownMenuItem
      disabled={!status?.connected || isToggling}
      onClick={() => toggle(synced)}
      className="flex gap-2 items-center"
    >
      <CalendarSync size={16} />
      {tripSyncLabel(synced)}
    </DropdownMenuItem>
  );
}
