import { useDispatch } from "react-redux";
import type { Trip } from "../../trips/types";
import { isValidationError } from "../../api/utils";
import { useDeleteTripMutation } from "../../trips/services/tripsApiSlice";
import { closeModal } from "../modalSlice";

export default function DeleteTripModal({ trip }: { trip: Trip }) {
  const [deleteTrip, { isLoading }] = useDeleteTripMutation();

  const { name } = trip;
  const dispatch = useDispatch();

  const handleClose = () => dispatch(closeModal());

  const handleDelete = async () => {
    try {
      await deleteTrip(trip.id).unwrap();
      handleClose();
    } catch (err) {
      if (isValidationError(err) && err.status === 404) {
        console.error("Trip not found.");
        // TODO: Add notification
      }
    }
  };
  return (
    <div className="card">
      <h2 className="title mb-4">Delete {name}?</h2>
      <div className="buttons flex justify-end gap-4">
        <button className="btn-secondary" onClick={handleClose}>
          Cancel
        </button>
        <button
          className="btn-error"
          disabled={isLoading}
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
