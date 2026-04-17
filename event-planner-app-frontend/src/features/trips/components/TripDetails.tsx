import Events from "../../events/components/EventList";
import type { Trip } from "../types";
import TripSummary from "./TripSummary";

export default function TripDetails(props: Trip) {
  return (
    <div className="flex flex-col gap-6">
      <TripSummary {...props} />
      <div>
        <h1 className="title mb-2">Itinerary</h1>
        <Events events={props.events} />
      </div>
    </div>
  );
}
