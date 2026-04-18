import { useDispatch } from "react-redux";
import type { Trip } from "../../trips/types";
import { closeModal } from "../modalSlice";

export default function DeleteTripModal({ trip }: { trip: Trip }) {
  const { name } = trip;
  const dispatch = useDispatch();

  const onCancel = () => dispatch(closeModal());
  return (
    <div className="card">
      <h2 className="title mb-4">Delete {name}?</h2>
      <div className="buttons flex justify-end gap-4">
        <button className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn-error">Delete</button>
      </div>
    </div>
  );
}
