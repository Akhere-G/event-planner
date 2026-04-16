import type { Trip } from "../types";
import TripSummary from "./TripSummary";

export default function TripDetails(props: Trip) {
  return (
    <div>
      <TripSummary {...props} />
    </div>
  );
}
