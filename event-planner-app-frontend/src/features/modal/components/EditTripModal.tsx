import { useNavigate } from "react-router";
import TripForm from "../../trips/components/TripForm";
import { useEditTripMutation } from "../../trips/services/tripsApiSlice";
import type { TripSchema } from "../../trips/schemas/tripSchema";
import type { Trip } from "../../trips/types";
import { useDispatch } from "react-redux";
import { closeModal } from "../modalSlice";
import { X } from "lucide-react";

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
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="title">Edit Trip</h2>
        <button
          className="p-0"
          aria-label="Close edit trip modal."
          onClick={() => dispatch(closeModal())}
        >
          <X size={24} />
        </button>
      </div>
      <TripForm
        submitBtnText="Edit Form"
        submitAction={onSubmit}
        isLoading={isLoading}
        initialData={trip}
      />
    </div>
  );
}
