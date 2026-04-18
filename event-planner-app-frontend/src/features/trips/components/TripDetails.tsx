import { DayList } from "../../events/components";
import type { Trip } from "../types";
import TripSummary from "./TripSummary";

export default function TripDetails(trip: Trip) {
  return (
    <div className="flex flex-col gap-6">
      <TripSummary {...trip} />
      <div>
        <h1 className="title mb-2 ml-4">Itinerary</h1>
        <DayList
          startDate={trip.startDate}
          endDate={trip.endDate}
          events={trip.events}
          role={trip.role}
        />
      </div>
    </div>
  );
}
