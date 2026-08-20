import { useSelector } from "react-redux";
import { canUserEdit } from "../../users/utils";
import DayCard from "./DayCard";
import type { RootState } from "../../../store";

export default function DayList({ role }: { role: string }) {
  const { days } = useSelector((state: RootState) => state.map);
  return (
    <div className="flex flex-col gap-4">
      {days.map((day) => (
        <div key={day.date} className="card p-0 ">
          <DayCard
            day={day}
            canEdit={canUserEdit(role)}
          />
        </div>
      ))}
    </div>
  );
}
