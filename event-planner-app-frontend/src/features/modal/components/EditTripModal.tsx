import TripForm from "../../trips/components/TripForm";
import { useEditTripMutation } from "../../trips/services/tripsApiSlice";
import type { TripSchema } from "../../trips/schemas/tripSchema";
import type { Trip } from "../../trips/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

interface EditTripModalProps {
  trip: Trip;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditTripModal({
  trip,
  open,
  onOpenChange,
}: EditTripModalProps) {
  const [editTrip, { isLoading }] = useEditTripMutation();

  async function onSubmit(updatedTrip: TripSchema) {
    await editTrip({ tripId: trip.id, updatedTrip }).unwrap();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
