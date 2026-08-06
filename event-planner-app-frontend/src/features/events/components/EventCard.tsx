import {
  Clock,
  Copy,
  ExternalLink,
  Eye,
  MoreVertical,
  Tag,
  Trash,
} from "lucide-react";
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
import useMenu from "../../../hooks/useMenu";

import { useParams } from "react-router";
import { useUpdateEvent } from "../../trips/hooks";
import { useGetTripQuery } from "../../trips/services/tripsApiSlice";
import { toast } from "sonner";
import EditEventDatesModal from "./EditEventDatesModal";
import { useDispatch } from "react-redux";
import { setIsMapView, setSelectedEvent } from "../../maps/service/mapSlice";

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

  const { openMenu, isMenuOpen, menuContainerRef, openButtonRef } = useMenu({
    closeOnClick: true,
  });

  const dispatch = useDispatch();

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

  const handleView = () => {
    dispatch(setSelectedEvent(event));
    dispatch(setIsMapView(true));
  };
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(eventData.address);
    toast.info("Copied!");
  };

  const handleOpenInMaps = () => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.name)},${encodeURIComponent(event.address)}`,
      "_blank",
    );
  };

  return (
    <div className="card flex-1 transition-shadow border-l-4 border-brand-primary relative">
      <div className="flex flex-col">
        <div className="flex justify-between items-start">
          <h3 className="font-bold tracking-tight text-text-primary flex flex-col">
            <span>{eventData.name}</span>
          </h3>

          <button
            ref={openButtonRef}
            className="p-1 hover:bg-surface-muted rounded transition-colors text-text-secondary"
            onClick={openMenu}
          >
            <MoreVertical size={16} />
          </button>
        </div>

        {isMenuOpen && (
          <div
            ref={menuContainerRef}
            className="absolute top-8 right-2 px-1 bg-surface rounded-md shadow-lg z-10 flex flex-col text-sm min-w-[160px]"
          >
            <button
              onClick={handleView}
              className="btn-menu text-left flex gap-2 items-center"
            >
              <Eye size={16} />
              View
            </button>
            <button
              onClick={handleCopyAddress}
              className="btn-menu text-left flex gap-2 items-center"
            >
              <Copy size={16} />
              Copy Address
            </button>
            <button
              onClick={handleOpenInMaps}
              className="btn-menu text-left flex gap-2 items-center"
            >
              <ExternalLink size={16} />
              Open in Maps
            </button>

            {canUserEdit(role) && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-menu text-error text-left flex gap-2 items-center"
              >
                <Trash size={16} />
                Delete
              </button>
            )}
          </div>
        )}

        <EditableSelect
          selectedValue={eventData.category}
          canEdit={canUserEdit(role)}
          defaultElement={
            <span className="flex items-center self-end gap-1 my-1 px-4 py-1 rounded-full bg-brand-secondary/10 text-brand-secondary text-xs font-semibold uppercase w-min">
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

        <div className="flex gap-2 items-center mb-2">
          <p className="text-sm text-text-secondary">{eventData.address}</p>
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
        </div>

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
