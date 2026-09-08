import type { Trip } from "../../trips/types";
import { isFetchBaseQueryError } from "../../api/utils";
import { useDeleteTripMutation } from "../../trips/services/tripsApiSlice";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { usePostHog } from "@posthog/react";

interface DeleteTripModalProps {
  trip: Trip;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteTripModal({
  trip,
  open,
  onOpenChange,
}: DeleteTripModalProps) {
  const [deleteTrip, { isLoading }] = useDeleteTripMutation();

  const { name } = trip;

  const posthog = usePostHog();
  const handleDelete = async () => {
    try {
      await deleteTrip(trip.id).unwrap();
      posthog?.capture("trip_deleted", {
        trip_id: trip.id,
      });

      onOpenChange(false);
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        toast.error((err.data as { message: string }).message);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="bg-brand-primary text-text-inverse p-4 -mx-4 -mt-4 rounded-t-xl">
          <DialogTitle>Delete {name}?</DialogTitle>
        </DialogHeader>
        <DialogDescription>This action cannot be undone.</DialogDescription>
        <DialogFooter>
          <button className="btn-secondary" onClick={() => onOpenChange(false)}>
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
