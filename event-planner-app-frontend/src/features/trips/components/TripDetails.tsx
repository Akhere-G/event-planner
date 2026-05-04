import { useState } from "react";
import { DayList } from "../../events/components";
import { isAdmin } from "../../users/utils";
import type { Trip } from "../types";
import TripSummary from "./TripSummary";
import { TripCalendar } from "../../calendar/components";
import { TripInsights } from "../../ai/components";

export default function TripDetails(trip: Trip) {
  const [isListView, setIsListView] = useState(true);

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <TripSummary trip={trip} showActions={isAdmin(trip.role)} />
      </div>
      <div>
        <div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-2 mb-4 px-4">
          <TripInsights trip={trip} />
          <h1 className="bg-canvas  mb-2 title text-text-canvas">Plans</h1>
          <div className="ml-auto">
            <button
              onClick={() => setIsListView(true)}
              className={`btn-secondary px-4 py-2 border-2 border-surface-border rounded-r-none active:scale-100 ${isListView ? "brightness-110" : ""}`}
            >
              List
            </button>
            <button
              onClick={() => setIsListView(false)}
              className={`btn-secondary px-4 py-2 border-2 border-surface-border border-l-0 rounded-l-none active:scale-100  ${isListView ? "" : "brightness-110"}`}
            >
              Calendar
            </button>
          </div>
        </div>
        {isListView ? (
          <DayList
            startDate={trip.startDate}
            endDate={trip.endDate}
            events={trip.events}
            role={trip.role}
          />
        ) : (
          <TripCalendar trip={trip} />
        )}
      </div>
    </div>
  );
}
