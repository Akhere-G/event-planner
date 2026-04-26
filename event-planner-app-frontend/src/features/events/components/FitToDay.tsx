import { useState } from "react";
import { Maximize, X } from "lucide-react";
import type { Day } from "../types";

export default function FitToDay({
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
      <div className="bg-surface rounded-xl hover:brightness-140">
        <button
          className="bg-brand-secondary/20 border-surface-border border py-2 px-4 text-sm w-35 max-h-30 overflow-y-scroll"
          onClick={() => fitToDay(daysWithEvents[0].date)}
        >
          Fit to day {daysWithEvents[0].day}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl">
      {expanded ? (
        <div className="card bg-brand-secondary/20 rounded-xl w-35">
          <div className="flex items-center justify-between gap-2 mb-2 ">
            <h3 className="">Fit to day</h3>
            <button
              className="p-0 translate-x-3 -translate-y-4"
              onClick={() => setExpanded(false)}
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex flex-col gap-1 max-h-40 overflow-y-scroll">
            {daysWithEvents.map((day) => (
              <button
                key={day.date}
                className="py-2 px-0 text-sm text-left hover:brightness-140!"
                onClick={() => fitToDay(day.date)}
              >
                <span className="whitespace-nowrap">Day {day.day}</span>
              </button>
            ))}
            <button
              className="py-2 px-0 text-sm text-left hover:brightness-140"
              onClick={fitToAll}
            >
              <span className="whitespace-nowrap">All</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="hover:brightness-200">
          <button
            className="bg-brand-secondary/20 btn-secondary p-2"
            onClick={() => setExpanded(true)}
          >
            <Maximize size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
