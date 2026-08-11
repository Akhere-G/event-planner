import { useDispatch } from "react-redux";
import type { Trip } from "../../trips/types";
import { isFetchBaseQueryError } from "../../api/utils";
import { useDeleteTripMutation } from "../../trips/services/tripsApiSlice";
import { closeModal } from "../modalSlice";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

export default function DeleteTripModal({ trip }: { trip: Trip }) {
  const [deleteTrip, { isLoading }] = useDeleteTripMutation();

  const { name } = trip;
  const dispatch = useDispatch();

  const handleDelete = async () => {
    try {
      await deleteTrip(trip.id).unwrap();
      dispatch(closeModal());
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        toast.error((err.data as { message: string }).message);
      }
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => dispatch(closeModal())}>
      <DialogContent>
        <DialogHeader className="bg-brand-primary text-text-inverse p-4 -mx-4 -mt-4 rounded-t-xl">
          <DialogTitle>Delete {name}?</DialogTitle>
        </DialogHeader>
        <DialogDescription>This action cannot be undone.</DialogDescription>
        <DialogFooter>
          <button
            className="btn-secondary"
            onClick={() => dispatch(closeModal())}
          >
            Cancel
          </button>
          <button
            className="btn-error"
            disabled={isLoading}
            onClick={handleDelete}
          >
            Delete
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
