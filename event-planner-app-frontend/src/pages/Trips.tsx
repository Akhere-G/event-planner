import { useNavigate } from "react-router";
import { EmptyState, ErrorState } from "../components";
import { TripCardSkeleton, TripList } from "../features/trips/components";
import { useGetTripsQuery } from "../features/trips/tripsApiSlice";

export default function Trips() {
  const { data, isLoading, isError } = useGetTripsQuery();
  const navigate = useNavigate();

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
    mainContent = <TripList trips={data.data.itineraries} />;
  }

  return (
    <div className="container flex flex-col gap-6">
      <div className="card">
        <h2 className="title mb-4">Your Trips</h2>
      </div>
      {mainContent}
    </div>
  );
}
