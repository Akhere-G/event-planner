import { useSelector } from "react-redux";
import { canUserEdit } from "../../users/utils";
import DayCard from "./DayCard";
import type { RootState } from "../../../store";
import { StateGate } from "../../../components";
import useTripEvents from "../hooks/useTripEvents";

export default function DayList({
  role,
  tripId,
}: {
  role: string;
  tripId: number;
}) {
  const { days } = useSelector((state: RootState) => state.map);
  const { isLoading, isError } = useTripEvents(tripId);

  return (
    <StateGate
      loadingStateProps={{ isLoading }}
      errorStateProps={{ isError, showReload: true }}
    >
      <div className="flex flex-col gap-4">
        {days.map((day) => (
          <div key={day.date} className="card p-0 ">
            <DayCard day={day} canEdit={canUserEdit(role)} />
          </div>
        ))}
      </div>
    </StateGate>
  );
}
