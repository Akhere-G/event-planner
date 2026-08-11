import { useState } from "react";
import { toast } from "sonner";
import {
  addMilliseconds,
  differenceInMilliseconds,
  format,
  isValid,
  parseISO,
} from "date-fns";
import type { Event } from "../types";
import { ConfirmModal, FormInput } from "../../../components";
import { isApiError } from "../../api/utils";

interface EditEventDatesModalProps {
  event: Event;
  tripStartDate: string;
  tripEndDate: string;
  onSave: (startAt: string, endAt: string) => Promise<void> | void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditEventDatesModal({
  event,
  tripStartDate,
  tripEndDate,
  onSave,
  open,
  onOpenChange,
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
      onOpenChange(false);
    } catch (err) {
      if (isApiError(err)) {
        toast.error(err.data.message);
      } else {
        toast.error("Failed to update event times.");
      }
    }
  };

  const minDatetime = `${tripStartDate}T00:00`;
  const maxDatetime = `${tripEndDate}T23:59`;

  function updateStartTime(newStartAt: string) {
    const newStartAtDate = new Date(newStartAt);

    if (!newStartAt || !isValid(newStartAtDate)) {
      setStartAt(newStartAt);
      return;
    }

    const endAtDate = new Date(endAt);

    if (!endAt || !isValid(endAtDate)) {
      const newEndAt = addMilliseconds(newStartAtDate, 60 * 60 * 1000);

      setStartAt(newStartAt);
      setEndAt(format(newEndAt, "yyyy-MM-dd'T'HH:mm"));
      return;
    }

    const oldStartAtDate = new Date(startAt);
    const duration = differenceInMilliseconds(endAtDate, oldStartAtDate);

    const newEndAt = addMilliseconds(newStartAtDate, duration);

    setStartAt(newStartAt);
    setEndAt(format(newEndAt, "yyyy-MM-dd'T'HH:mm"));
  }
  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      confirmAction={handleSubmit}
      title="Edit event times"
      confirmButtonProps={{
        className: "btn-primary py-5",
      }}
      confirmText="Save"
    >
      <div className="space-y-4">
        <p className="text-xs text-text-secondary">
          Update the times for <strong>{event.name}</strong>.
        </p>
        <FormInput
          type="datetime-local"
          label="Start At"
          name="startAt"
          value={startAt}
          onChange={(e) => updateStartTime(e.target.value)}
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
