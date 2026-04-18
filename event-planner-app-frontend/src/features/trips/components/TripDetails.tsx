import { DayList } from "../../events/components";
import type { Trip } from "../types";
import TripSummary from "./TripSummary";

export default function TripDetails(props: Trip) {
  return (
    <div className="flex flex-col gap-6">
      <TripSummary {...props} />
      <div>
        <h1 className="title mb-2 ml-4">Itinerary</h1>
        <DayList
          startDate={props.startDate}
          endDate={props.endDate}
          events={props.events}
        />
      </div>
    </div>
  );
}
