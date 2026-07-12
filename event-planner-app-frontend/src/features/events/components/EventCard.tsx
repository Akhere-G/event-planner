import { Clock, Copy, ExternalLink, Tag, Trash } from "lucide-react";
import { format, parseISO } from "date-fns";
import { type Event } from "../types";
import { canUserEdit } from "../../users/utils";
import { useState } from "react";
import {
  ConfirmModal,
  EditableSelect,
  EditableText,
  StateGate,
} from "../../../components";
import { eventCategories } from "../constants";

import { useParams } from "react-router";
import { useUpdateEvent } from "../../trips/hooks";
import { useGetTripQuery } from "../../trips/services/tripsApiSlice";
import { toast } from "sonner";
import EditEventDatesModal from "./EditEventDatesModal";

interface EventCardProps {
  event: Event;
  handleDelete?: (id: number) => Promise<void>;
  handleEdit?: (eventId: number, updatedEvent: Partial<Event>) => Promise<void>;
  role: string;
  tripStartDate?: string;
  tripEndDate?: string;
}
// TODO: Use shadcn popup for category select.
// TODO: Allow for name edit
// TODO: Add show in map function for event cards in list

export function EventCard({
  event,
  handleDelete = async () => {},
  handleEdit = async () => {},
  role,
  tripStartDate = "",
  tripEndDate = "",
}: EventCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [eventData, setEventData] = useState(event);
  const start = parseISO(eventData.startAt);
  const end = parseISO(eventData.endAt);

  const updateEventData = async (newData: Partial<Event>) => {
    const oldData = eventData;
    try {
      setEventData((prev) => ({ ...prev, ...newData }));
      await handleEdit(event.id, newData);
    } catch {
      setEventData(oldData);
    }
  };

  const closeDeleteModal = () => setIsModalOpen(false);

  return (
    <div className="card flex-1 transition-shadow border-l-4 border-brand-primary">
      <div className="flex flex-col">
        <div className="flex justify-between items-center ">
          <h3 className="font-bold tracking-tight text-text-primary flex flex-col">
            <span>{eventData.name}</span>
          </h3>

          <EditableSelect
            selectedValue={eventData.category}
            canEdit={canUserEdit(role)}
            defaultElement={
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-brand-secondary/10 text-brand-secondary text-xs font-semibold uppercase">
                <Tag size={16} />
                {eventData.category}
              </span>
            }
            setValue={(category) => {
              updateEventData({ category });
            }}
            options={eventCategories}
            selectClassName="flex flex-col items-stretch text-center!"
          />
        </div>
        <div className="flex gap-2 items-center mb-2">
          <p className="text-sm text-text-secondary">{eventData.address}</p>
          <button
            title="Copy Address"
            className="btn p-1 hover:bg-text-primary/10 rounded transition-colors text-text-primary"
            onClick={() => {
              navigator.clipboard.writeText(eventData.address);
              toast.info("Copied!");
            }}
          >
            <Copy size={12} />
          </button>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.name)},${encodeURIComponent(event.address)}`}
            target="_blank"
            rel="noreferrer"
            className="btn p-1 hover:bg-brand-primary/10 rounded transition-colors text-brand-primary"
            title="Open in Google Maps"
          >
            <ExternalLink size={12} />
          </a>
        </div>

        <EditableText
          value={eventData?.description ?? ""}
          canEdit={canUserEdit(role)}
          setValue={(description) => {
            updateEventData({ description });
          }}
          textClassName="text-xs text-text-secondary"
          inputClassName="text-xs"
          emptyText="Add notes"
        />

        <div className="mt-2 flex gap-4 justify-between text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-brand-primary" />
            <div className="flex gap-1 text-xs!">
              {canUserEdit(role) ? (
                <>
                  <button
                    onClick={() => setIsDateModalOpen(true)}
                    className="hover:text-brand-primary p-0"
                    title="Change event times"
                  >
                    {format(start, "p")}
                  </button>
                  <span>-</span>
                  <button
                    onClick={() => setIsDateModalOpen(true)}
                    className="hover:text-brand-primary p-0"
                    title="Change event times"
                  >
                    {format(end, "p")}
                  </button>
                </>
              ) : (
                <>
                  <span>{format(start, "p")}</span>
                  <span>-</span>
                  <span>{format(end, "p")}</span>
                </>
              )}
            </div>
          </div>

          {canUserEdit(role) && (
            <button
              className="p-0 group"
              aria-label="delete event"
              onClick={() => setIsModalOpen(true)}
            >
              <Trash
                size={16}
                className="group-hover:hover:stroke-error duration-300"
                aria-hidden
              />
            </button>
          )}

          {isModalOpen && (
            <ConfirmModal
              title={`Delete '${eventData.name}'`}
              closeModal={closeDeleteModal}
              confirmAction={() => handleDelete(eventData.id)}
            />
          )}

          {isDateModalOpen && (
            <EditEventDatesModal
              event={eventData}
              tripStartDate={tripStartDate}
              tripEndDate={tripEndDate}
              isOpen={isDateModalOpen}
              onClose={() => setIsDateModalOpen(false)}
              onSave={async (startAt, endAt) => {
                await updateEventData({ startAt, endAt });
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function EventCardConnected({
  event,
  onDelete = () => {},
  onEdit = () => {},
}: {
  event: Event;
  onDelete?: () => void;
  onEdit?: () => void;
}) {
  const tripId = Number(useParams()?.tripId);
  const { data, isLoading, isError } = useGetTripQuery(Number(tripId));

  const { handleDelete, handleEdit } = useUpdateEvent({
    tripId,
    onEdit,
    onDelete,
  });

  return (
    <StateGate loadingStateProps={{ isLoading }} errorStateProps={{ isError }}>
      {data && (
        <EventCard
          role={data?.data.role}
          event={event}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
          tripStartDate={data?.data.startDate}
          tripEndDate={data?.data.endDate}
        />
      )}
    </StateGate>
  );
}
