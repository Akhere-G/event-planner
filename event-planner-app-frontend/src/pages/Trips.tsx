import { TripList } from "../features/trips/components";
import { useGetTripsQuery } from "../features/trips/tripsApiSlice";

export default function Trips() {
  const { data, isLoading, isError } = useGetTripsQuery();

  if (isLoading) {
    return <div>...loading</div>;
  }

  if (isError) {
    return <div>Something went wrong</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <h2 className="title mb-4">Your Trips</h2>
      </div>
      {data?.data && <TripList trips={data.data.itineraries} />}
    </div>
  );
}
