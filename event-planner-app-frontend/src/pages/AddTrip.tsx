import { useNavigate } from "react-router";
import TripForm from "../features/trips/components/TripForm";
import type { TripSchema } from "../features/trips/schemas/tripSchema";
import { useAddTripMutation } from "../features/trips/services/tripsApiSlice";

export default function Addtrip() {
  const [addTrip, { isLoading }] = useAddTripMutation();
  const navigate = useNavigate();

  async function onSubmit(trip: TripSchema) {
    await addTrip(trip).unwrap();
    navigate("/");
  }

  return (
    <div className="container">
      <div className="card">
        <h2 className="title mb-4">Add Trip</h2>
        <TripForm
          submitAction={onSubmit}
          submitBtnText="Add Trip"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
