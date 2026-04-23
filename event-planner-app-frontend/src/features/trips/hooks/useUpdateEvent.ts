import { isFetchBaseQueryError } from "../../api/utils";
import {
  useDeleteEventMutation,
  useUpdateEventMutation,
} from "../../events/service/eventApiSlice";
import type { Event } from "../../events/types";

export default function useUpdateEvent({
  tripId,
  onDelete = () => {},
  onEdit = () => {},
}: {
  tripId: number;
  onDelete?: () => void;
  onEdit?: () => void;
}) {
  const [deleteEvent] = useDeleteEventMutation();
  const [updateEvent] = useUpdateEventMutation();

  async function handleDelete(eventId: number) {
    try {
      await deleteEvent({ tripId, eventId }).unwrap();
      onDelete();
    } catch (err) {
      if (isFetchBaseQueryError(err) && err.status === 404) {
        console.log("Event not found");
        // TODO: Add toast notifcation
      }
    }
  }

  async function handleEdit(eventId: number, updatedEvent: Partial<Event>) {
    try {
      await updateEvent({
        tripId: Number(tripId),
        eventId,
        updatedEvent,
      }).unwrap();
      onEdit();
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        if (err.status === 404) {
          console.log("Event not found");
          // TODO: Add toast notifcation
        } else if (err.status === 400) {
          // TODO: Add toast notifcation
          throw err;
        }
      }
    }
  }

  return { handleDelete, handleEdit };
}
