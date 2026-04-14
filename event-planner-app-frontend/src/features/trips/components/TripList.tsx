import type { Trip } from "../types";
import TripCard from "./TripCard";

export default function TripList({
  trips,
  getMore,
  hasMore,
}: {
  trips: Trip[];
  getMore: () => void;
  hasMore: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 justify-stretch md:items-start">
      <div className="w-full grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ">
        {trips.map((trip) => (
          <TripCard key={trip.id} {...trip} />
        ))}
      </div>
      {hasMore && (
        <button className="btn-primary" onClick={getMore}>
          Load More
        </button>
      )}
    </div>
  );
}
