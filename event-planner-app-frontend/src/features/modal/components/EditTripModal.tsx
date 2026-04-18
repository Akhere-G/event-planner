import { useNavigate } from "react-router";
import TripForm from "../../trips/components/TripForm";
import { useEditTripMutation } from "../../trips/services/tripsApiSlice";
import type { TripSchema } from "../../trips/schemas/tripSchema";
import type { Trip } from "../../trips/types";
import { useDispatch } from "react-redux";
import { closeModal } from "../modalSlice";

export interface EditTripModalProps {
  trip: Trip;
}
export default function EditTripModal({ trip }: { trip: Trip }) {
  const [editTrip, { isLoading }] = useEditTripMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  async function onSubmit(updatedTrip: TripSchema) {
    await editTrip({ tripId: trip.id, updatedTrip }).unwrap();
    dispatch(closeModal());
    navigate("/");
  }

  return (
    <div className="card">
      <h2 className="title mb-4">Edit Trip</h2>
      <TripForm
        submitBtnText="Edit Form"
        submitAction={onSubmit}
        isLoading={isLoading}
        initialData={trip}
      />
    </div>
  );
}
