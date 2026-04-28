import { DayList } from "../../events/components";
import { isAdmin } from "../../users/utils";
import type { Trip } from "../types";
import TripSummary from "./TripSummary";

export default function TripDetails(trip: Trip) {
  return (
    <div className="flex flex-col gap-6 ">
      <div className="card ">
        <TripSummary trip={trip} showActions={isAdmin(trip.role)} />
      </div>
      <div>
        <h1 className="bg-canvas mb-2 ml-4 title text-text-canvas">
          Itinerary
        </h1>
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
