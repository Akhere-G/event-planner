import { ConfirmModal } from "../../../components";
import type { Event } from "../types";
import UpdateEventForm from "./UpdateEventForm";
import { useRemoteChangeWarning } from "../../realtime";

export default function EditEventModal({
  event,
  open,
  onOpenChange,
  onSave,
}: {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (event: Event) => Promise<void>;
}) {
  useRemoteChangeWarning("event", open);

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Edit ${event.name}`}
      confirmAction={() => onSave(event)}
      confirmText="Edit "
      hideButtons
    >
      <UpdateEventForm
        initialEvent={event}
        onClose={() => onOpenChange(false)}
      />
    </ConfirmModal>
  );
}
