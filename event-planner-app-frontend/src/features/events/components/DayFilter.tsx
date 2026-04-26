import { useState } from "react";
import type { Day } from "../types";
import { Layers3, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { setDays } from "../../maps/service/mapSlice";

export function DayFilter({
  days,
  setDays,
}: {
  days: Day[];
  setDays: (days: Day[]) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const daysWithEvents = days.filter((day) => day.events.length > 0);

  const allChecked = daysWithEvents.every((day) => day.show);
  const noneChecked = daysWithEvents.every((day) => !day.show);

  const toggleDay = (date: string) => {
    setDays(
      days.map((day) =>
        day.date === date ? { ...day, show: !day.show } : day,
      ),
    );
  };

  const selectAllDays = () => {
    setDays(days.map((day) => ({ ...day, show: true })));
  };

  const deselectAllDays = () => {
    setDays(days.map((day) => ({ ...day, show: false })));
  };

  return (
    <div className="rounded-xl bg-surface">
      {expanded ? (
        <div className="card bg-brand-secondary/20 rounded-xl w-35">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="">Filter</h3>
            <button
              className="p-0 translate-x-3 -translate-y-4"
              onClick={() => setExpanded(false)}
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {daysWithEvents.map((day) => (
              <label
                key={day.date}
                className="w-fit flex items-center justify-between gap-2  text-sm"
              >
                <input
                  type="checkbox"
                  className="p-0 m-0"
                  checked={day.show}
                  onChange={() =>
                    toggleDay(new Date(day.date).toISOString().substring(0, 10))
                  }
                />
                <span className="whitespace-nowrap">Day {day.day}</span>
              </label>
            ))}
            <label className="w-fit flex items-center justify-between gap-2  text-sm">
              <input
                type="checkbox"
                className="p-0 m-0"
                checked={allChecked}
                onChange={selectAllDays}
              />
              <span className="whitespace-nowrap">Select All</span>
            </label>
            <label className="w-fit flex items-center justify-between gap-2  text-sm">
              <input
                type="checkbox"
                className="p-0 m-0"
                checked={noneChecked}
                onChange={deselectAllDays}
              />
              <span className="whitespace-nowrap">Deselect All</span>
            </label>
          </div>
        </div>
      ) : (
        <button
          className="btn-secondary bg-brand-secondary/20 p-2"
          onClick={() => setExpanded(true)}
        >
          <Layers3 size={20} />
        </button>
      )}
    </div>
  );
}

export default function DayFilterConnected() {
  const { days } = useSelector((state: RootState) => state.map);
  const dispatch = useDispatch();
  return <DayFilter days={days} setDays={(days) => dispatch(setDays(days))} />;
}
