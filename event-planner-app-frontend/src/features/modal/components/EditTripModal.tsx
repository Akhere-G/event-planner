import { useNavigate } from "react-router";
import TripForm from "../../trips/components/TripForm";
import { useEditTripMutation } from "../../trips/services/tripsApiSlice";
import type { TripSchema } from "../../trips/schemas/tripSchema";
import type { Trip } from "../../trips/types";
import { useDispatch } from "react-redux";
import { closeModal } from "../modalSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

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
    <Dialog open={true} onOpenChange={() => dispatch(closeModal())}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="bg-brand-primary text-text-inverse p-4 -mx-4 -mt-4 rounded-t-xl">
          <DialogTitle>Edit Trip</DialogTitle>
        </DialogHeader>
        <TripForm
          submitBtnText="Edit Form"
          submitAction={onSubmit}
          isLoading={isLoading}
          initialData={trip}
        />
      </DialogContent>
    </Dialog>
  );
}
