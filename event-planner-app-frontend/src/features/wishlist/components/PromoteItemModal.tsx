import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import type { WishlistItem } from "../types";

interface PromoteItemModalProps {
  item: WishlistItem;
  startDate: string;
  endDate: string;
  onClose: () => void;
  onSchedule: (startAt: string, endAt: string) => Promise<void> | void;
}

export default function PromoteItemModal({
  item,
  startDate,
  endDate,
  onClose,
  onSchedule,
}: PromoteItemModalProps) {
  const [date, setDate] = useState(startDate);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="backdrop bg-black/50 z-50">
      <div className="card w-full max-w-sm m-4 p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-surface-border pb-2">
          <h3 className="font-bold text-text-main text-sm">
            Schedule activity
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            <X size={16} />
          </button>
        </div>
        <div>
          <p className="text-xs text-text-secondary mb-2">
            Set times to place <strong>{item.name}</strong> onto your itinerary.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Choose Date
            </label>
            <input
              type="date"
              min={startDate}
              max={endDate}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-surface-border text-xs focus:ring-1 focus:ring-brand-primary bg-surface"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-surface-border text-xs focus:ring-1 focus:ring-brand-primary bg-surface"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-surface-border text-xs focus:ring-1 focus:ring-brand-primary bg-surface"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary py-2 text-xs"
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-primary py-2 text-xs">
              Schedule activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
