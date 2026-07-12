import { useState } from "react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import type { Event } from "../types";
import { ConfirmModal, FormInput } from "../../../components";
import { isApiError } from "../../api/utils";

interface EditEventDatesModalProps {
  event: Event;
  tripStartDate: string;
  tripEndDate: string;
  onSave: (startAt: string, endAt: string) => Promise<void> | void;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditEventDatesModal({
  event,
  tripStartDate,
  tripEndDate,
  onSave,
  isOpen,
  onClose,
}: EditEventDatesModalProps) {
  const formatForInput = (isoStr: string) => {
    try {
      return format(parseISO(isoStr), "yyyy-MM-dd'T'HH:mm");
    } catch {
      return "";
    }
  };

  const [startAt, setStartAt] = useState(formatForInput(event.startAt));
  const [endAt, setEndAt] = useState(formatForInput(event.endAt));

  const handleSubmit = async () => {
    if (!startAt || !endAt) {
      toast.error("Please fill in both start and end times.");
      return;
    }

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    if (endDate <= startDate) {
      toast.error("End time must be after start time.");
      return;
    }

    const formattedStart = format(startDate, "yyyy-MM-dd HH:mm");
    const formattedEnd = format(endDate, "yyyy-MM-dd HH:mm");

    try {
      await onSave(formattedStart, formattedEnd);
      onClose();
    } catch (err) {
      if (isApiError(err)) {
        toast.error(err.data.message);
      } else {
        toast.error("Failed to update event times.");
      }
    }
  };

  if (!isOpen) return null;

  const minDatetime = `${tripStartDate}T00:00`;
  const maxDatetime = `${tripEndDate}T23:59`;

  return (
    <ConfirmModal
      closeModal={onClose}
      confirmAction={handleSubmit}
      title="Edit event times"
      confirmButtonProps={{
        className: "btn-primary",
      }}
      confirmText="Save"
    >
      <div className="p-4 space-y-4">
        <p className="text-xs text-text-secondary">
          Update the times for <strong>{event.name}</strong>.
        </p>
        <FormInput
          type="datetime-local"
          label="Start At"
          name="startAt"
          value={startAt}
          onChange={(e) => setStartAt(e.target.value)}
          // @ts-expect-error min is used by base input component
          min={minDatetime}
          max={maxDatetime}
        />
        <FormInput
          type="datetime-local"
          label="End At"
          name="endAt"
          value={endAt}
          onChange={(e) => setEndAt(e.target.value)}
          // @ts-expect-error min is used by base input component
          min={minDatetime}
          max={maxDatetime}
        />
      </div>
    </ConfirmModal>
  );
}
