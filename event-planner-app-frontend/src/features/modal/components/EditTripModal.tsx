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
import {
  useGetPreferencesQuery,
  useSavePreferencesMutation,
} from "../../trips/services/preferencesApiSlice";
import { preferencesFromApi } from "../../trips/preferenceUtils";
import type { PreferencesInput } from "../../trips/schemas/preferencesSchema";
import { StateGate } from "../../../components";
import { toast } from "sonner";
import { usePostHog } from "@posthog/react";

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
  const [savePreferences, { isLoading: isSavingPreferences }] =
    useSavePreferencesMutation();
  const preferencesQuery = useGetPreferencesQuery(trip.id, { skip: !open });
  const posthog = usePostHog();

  async function onSubmit(
    updatedTrip: TripSchema,
    preferences: PreferencesInput,
  ) {
    await editTrip({ tripId: trip.id, updatedTrip }).unwrap();
    await savePreferences({ tripId: trip.id, preferences }).unwrap();
    toast.success("Trip updated.");
    posthog?.capture("trip_edited", {
      trip_id: trip.id,
    });

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="bg-brand-primary text-text-inverse p-4 -mx-4 -mt-4 rounded-t-xl">
          <DialogTitle>Edit Trip</DialogTitle>
        </DialogHeader>
        <StateGate
          loadingStateProps={{
            isLoading: preferencesQuery.isLoading,
            message: "Loading preferences...",
          }}
          errorStateProps={{
            isError: preferencesQuery.isError,
            message: "Could not load trip preferences.",
          }}
        >
          <TripForm
            variant="single"
            submitBtnText="Save changes"
            submitAction={onSubmit}
            isLoading={isLoading || isSavingPreferences}
            initialData={trip}
            initialPreferences={preferencesFromApi(preferencesQuery.data?.data)}
          />
        </StateGate>
      </DialogContent>
    </Dialog>
  );
}
