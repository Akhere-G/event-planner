import { useState } from "react";
import { Maximize, X } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { useMap } from "@vis.gl/react-google-maps";
import { fitToBounds } from "../../maps/utils";
import type { Day } from "../../events/types";

export function FitToDay({
  days,
  fitToDay,
  fitToAll,
}: {
  days: Day[];
  fitToDay: (day: string) => void;
  fitToAll: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const daysWithEvents = days.filter(
    (day) => day.events.length > 0 && day.show,
  );
  if (daysWithEvents.length === 0) return;
  if (daysWithEvents.length === 1) {
    return (
      <div className="bg-surface rounded-xl hover:brightness-110 shadow-md">
        <button
          className="btn bg-brand-secondary text-text-inverse border-surface-border border py-2 px-4 text-sm w-35 max-h-30 overflow-y-scroll"
          onClick={() => fitToDay(daysWithEvents[0].date)}
        >
          Fit to day {daysWithEvents[0].day}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl shadow-md">
      {expanded ? (
        <div className="card bg-brand-secondary text-text-inverse rounded-xl w-35">
          <div className="flex items-center justify-between gap-2 mb-2 ">
            <h3 className="">Fit to day</h3>
            <button
              className="btn shadow-md p-0 translate-x-3 -translate-y-4"
              onClick={() => setExpanded(false)}
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex flex-col gap-1 max-h-40 overflow-y-scroll">
            {daysWithEvents.map((day) => (
              <button
                key={day.date}
                className="btn py-2 px-0 text-sm text-left"
                onClick={() => fitToDay(day.date)}
              >
                <span className="whitespace-nowrap">Day {day.day}</span>
              </button>
            ))}
            <button
              className="btn py-2 px-0 text-sm text-left"
              onClick={fitToAll}
            >
              <span className="whitespace-nowrap">All</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          className="bg-brand-secondary text-text-inverse btn-secondary p-2"
          onClick={() => setExpanded(true)}
        >
          <Maximize size={20} />
        </button>
      )}
    </div>
  );
}

export default function FitToDayConnected() {
  const { days } = useSelector((state: RootState) => state.map);
  const map = useMap();

  const selectedEvents = days
    .filter((day) => day.show)
    .flatMap((day) => day.events);

  const fitToAll = () => {
    if (map) fitToBounds({ map, events: selectedEvents });
  };

  const fitToDay = (date: string) => {
    const selectedEvents = days.find((day) => day.date === date)?.events;
    if (!selectedEvents) {
      console.error("Could not find events for this date");
      return;
    }
    if (map) fitToBounds({ map, events: selectedEvents });
  };

  return <FitToDay days={days} fitToAll={fitToAll} fitToDay={fitToDay} />;
}
