import { useNavigate } from "react-router";
import { StateGate } from "../components";
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
  return (
    <div className="container flex flex-col gap-6">
      <div className="card">
        <h2 className="title">Your Trips</h2>
      </div>
      <StateGate
        loadingStateProps={{
          isLoading,
          customSkeleton: (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ">
              {new Array(3).fill(0).map((_, i) => (
                <TripCardSkeleton key={i} />
              ))}
            </div>
          ),
        }}
        errorStateProps={{
          isError,
        }}
        emptyStateProps={{
          isEmpty: !data || data?.data.itineraries.length === 0,
          message: "No trips.",
          action: {
            text: "Create new trip?",
            onClick: () => navigate("/addtrip"),
          },
        }}
      >
        <TripList
          trips={data?.data.itineraries ?? []}
          hasMore={data?.data.hasMore}
          getMore={getMore}
        />
      </StateGate>
    </div>
  );
}
