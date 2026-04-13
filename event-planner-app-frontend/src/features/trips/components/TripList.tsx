import type { Trip } from "../types";
import TripCard from "./TripCard";

export default function TripList({ trips }: { trips: Trip[] }) {
  console.log(trips);
  return (
    <div className="py-4 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ">
      {trips.map((trip) => (
        <TripCard {...trip} />
      ))}
    </div>
  );
}
