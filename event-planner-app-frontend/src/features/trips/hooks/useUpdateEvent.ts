import { toast } from "sonner";
import { isFetchBaseQueryError } from "../../api/utils";
import {
  useDeleteEventMutation,
  useUpdateEventMutation,
} from "../../events/service/eventApiSlice";
import type { Event } from "../../events/types";
import { useGetTripQuery } from "../services/tripsApiSlice";
import { usePostHog } from "@posthog/react";

export default function useUpdateEvent({
  tripId,
  onDelete = () => {},
  onEdit = () => {},
}: {
  tripId: number;
  onDelete?: () => void;
  onEdit?: () => void;
}) {
  const { data } = useGetTripQuery(Number(tripId));
  const trip = data?.data;
  const posthog = usePostHog();
  const [deleteEvent] = useDeleteEventMutation();
  const [updateEvent] = useUpdateEventMutation();

  async function handleDelete(eventId: number) {
    try {
      await deleteEvent({ tripId, eventId }).unwrap();
      onDelete();
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        toast.error((err.data as { message: string }).message);
      }
    }
  }

  async function handleEdit(eventId: number, updatedEvent: Partial<Event>) {
    if (!trip) return;
    try {
      await updateEvent({
        tripId: Number(tripId),
        eventId,
        updatedEvent,
        timezone: trip.timezone,
      }).unwrap();
      onEdit();
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        toast.error((err.data as { message: string }).message);
      } else {
        posthog?.captureException(err);
        toast.error("Sorry! Something went wrong...");
      }
      throw err;
    }
  }

  return { handleDelete, handleEdit };
}
