import EventCardConnected from "../../events/components/EventCard";
import type { Event } from "../../events/types";
import { Dialog, DialogContent } from "../../../components/ui/dialog";

interface EventModalProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EventModal({
  event,
  open,
  onOpenChange,
}: EventModalProps) {
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl pt-10">
        <EventCardConnected
          event={event}
          onDelete={() => onOpenChange(false)}
          onEdit={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
