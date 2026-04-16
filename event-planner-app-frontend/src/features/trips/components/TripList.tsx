import { Plus } from "lucide-react";
import type { Trip } from "../types";
import TripCard from "./TripCard";
import { Link } from "react-router";

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
        <Link
          to="/addtrip"
          className="border-brand-primary border-2 h-full w-full rounded-md flex justify-center items-center gap-2 font-bold min-h-54"
        >
          <Plus className="text-brand-primary" />
          <p className="text-brand-primary">Add new itinerary</p>
        </Link>
      </div>
      {hasMore && (
        <button className="btn-primary" onClick={getMore}>
          Load More
        </button>
      )}
    </div>
  );
}
