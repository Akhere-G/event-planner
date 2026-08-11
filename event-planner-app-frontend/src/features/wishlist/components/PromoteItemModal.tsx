import { useState } from "react";
import { toast } from "sonner";
import type { WishlistItem } from "../types";
import { ConfirmModal } from "../../../components";

interface PromoteItemModalProps {
  item: WishlistItem;
  startDate: string;
  endDate: string;
  onSchedule: (startAt: string, endAt: string) => Promise<void> | void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PromoteItemModal({
  item,
  startDate,
  endDate,
  onSchedule,
  open,
  onOpenChange,
}: PromoteItemModalProps) {
  const [date, setDate] = useState(startDate);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");

  const handleSubmit = async () => {
    if (!date) {
      toast.error("Please select a date.");
      return;
    }

    const startAtStr = `${date}T${startTime}:00Z`;
    const endAtStr = `${date}T${endTime}:00Z`;

    if (new Date(endAtStr) <= new Date(startAtStr)) {
      toast.error("End time must be after start time.");
      return;
    }

    await onSchedule(startAtStr, endAtStr);
  };

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      confirmAction={handleSubmit}
      title="Schedule activity"
      confirmButtonProps={{
        className: "btn-primary",
      }}
      confirmText="Schedule activity"
    >
      <div className="p-2 py-4">
        <p className="text-xs text-text-secondary mb-2">
          Set times for <strong>{item.name}</strong> and add it to your
          itinerary.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 px-2 pb-1">
        <div>
          <label className="block font-semibold text-text-secondary mb-1">
            Choose Date
          </label>
          <input
            type="date"
            min={startDate}
            max={endDate}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-surface-border focus:ring-1 focus:ring-brand-primary bg-surface"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-text-secondary mb-1">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-surface-border  focus:ring-1 focus:ring-brand-primary bg-surface"
              required
            />
          </div>
          <div>
            <label className="block  font-semibold text-text-secondary mb-1">
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-surface-border focus:ring-1 focus:ring-brand-primary bg-surface"
              required
            />
          </div>
        </div>
      </form>
    </ConfirmModal>
  );
}
