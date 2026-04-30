import { X } from "lucide-react";
import EventCardConnected from "../../events/components/EventCard";
import type { Event } from "../../events/types";

interface EventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventModal({
  event,
  isOpen,
  onClose,
}: EventModalProps) {
  if (!isOpen || !event) return null;

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-1 p-1 rounded-full bg-surface-muted hover:bg-surface-border transition-colors z-10"
          aria-label="Close modal"
        >
          <X size={16} className="text-text-secondary" />
        </button>

        <div className="p-4 pt-8">
          <EventCardConnected
            event={event}
            onDelete={onClose}
            onEdit={onClose}
          />
        </div>
      </div>
    </div>
  );
}
