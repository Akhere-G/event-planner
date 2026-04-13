import { useGetTripsQuery } from "../features/trips/tripsApiSlice";

export default function Trips() {
  const { isLoading, isError } = useGetTripsQuery();

  if (isLoading) {
    return <div>...loading</div>;
  }

  if (isError) {
    return <div>Something went wrong</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <h2 className="title">Trips</h2>
        <p>Your trips</p>
      </div>
    </div>
  );
}
