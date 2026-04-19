import { useNavigate } from "react-router";
import { EmptyState, ErrorState } from "../components";
import { TripCardSkeleton, TripList } from "../features/trips/components";
import { useGetTripsQuery } from "../features/trips/services/tripsApiSlice";
import { useState } from "react";

const LIMIT = 12;

export default function Trips() {
  const [offset, setOffset] = useState(0);
  const { data, isLoading, isError } = useGetTripsQuery({
    limit: LIMIT,
    offset,
  });
  const navigate = useNavigate();

  const getMore = () => setOffset((prev) => prev + LIMIT);

  let mainContent = <></>;
  if (isLoading) {
    mainContent = (
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ">
        {new Array(3).fill(0).map((_, i) => (
          <TripCardSkeleton key={i} />
        ))}
      </div>
    );
  } else if (isError) {
    mainContent = <ErrorState showReload />;
  } else if (!data || data.data.itineraries.length === 0) {
    mainContent = (
      <EmptyState
        message="No trips yet."
        action={{
          text: "Create new trip?",
          onClick: () => navigate("/addtrip"),
        }}
      />
    );
  } else {
    mainContent = (
      <TripList
        trips={data.data.itineraries}
        hasMore={data.data.hasMore}
        getMore={getMore}
      />
    );
  }

  return (
    <div className="container flex flex-col gap-6">
      <div className="card">
        <h2 className="title">Your Trips</h2>
      </div>
      {mainContent}
    </div>
  );
}
