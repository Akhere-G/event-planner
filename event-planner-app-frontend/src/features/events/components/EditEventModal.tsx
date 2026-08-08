import { ConfirmModal } from "../../../components";
import type { Event } from "../types";
import UpdateEventForm from "./UpdateEventForm";

export default function EditEventModal({
  event,
  onClose,
  onSave,
}: {
  event: Event;
  onClose: () => void;
  onSave: (event: Event) => Promise<void>;
}) {
  return (
    <ConfirmModal
      closeModal={onClose}
      title={`Edit ${event.name}`}
      confirmAction={() => onSave(event)}
      confirmText="Edit "
      hideButtons
    >
      <div className="card">
        <UpdateEventForm initialEvent={event} onClose={onClose} />
      </div>
    </ConfirmModal>
  );
}
