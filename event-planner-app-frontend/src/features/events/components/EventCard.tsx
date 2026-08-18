import {
  Clock,
  Copy,
  Edit,
  ExternalLink,
  Eye,
  MapPin,
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

import { useParams } from "react-router";
import { useUpdateEvent } from "../../trips/hooks";
import { useGetTripQuery } from "../../trips/services/tripsApiSlice";
import { toast } from "sonner";
import EditEventDatesModal from "./EditEventDatesModal";
import { useDispatch } from "react-redux";
import { setIsMapView, setSelectedEvent } from "../../maps/service/mapSlice";
import EditEventModal from "./EditEventModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

export default function EventCard({
  event,
  onDelete = () => {},
  onEdit = () => {},
}: {
  event: Event;
  onDelete?: () => void;
  onEdit?: () => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [eventData, setEventData] = useState(event);
  const start = parseISO(eventData.startAt);
  const end = parseISO(eventData.endAt);

  const tripId = Number(useParams()?.tripId);
  const { data, isLoading, isError } = useGetTripQuery(Number(tripId));

  const trip = data?.data;

  const { handleDelete, handleEdit } = useUpdateEvent({
    tripId,
    onEdit,
    onDelete,
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

  if (!trip) return null;
  return (
    <StateGate loadingStateProps={{ isLoading }} errorStateProps={{ isError }}>
      <div className="card flex-1 transition-shadow border-l-4 border-brand-primary relative">
        <div className="flex flex-col">
          <div className="flex justify-between items-start">
            <h3 className="font-bold tracking-tight text-text-primary flex flex-col">
              <EditableText
                value={eventData.name}
                canEdit={canUserEdit(trip.role)}
                textClassNames="text-lg"
                setValue={(name) => {
                  updateEventData({ name });
                  handleEdit(eventData.id, { name });
                }}
              />
            </h3>

            <DropdownMenu>
              <DropdownMenuTrigger className="p-1 hover:bg-surface-muted rounded transition-colors text-text-secondary">
                <MoreVertical size={16} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-40">
                <DropdownMenuItem
                  onClick={handleView}
                  className="flex gap-2 items-center"
                >
                  <Eye size={16} />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleCopyAddress}
                  className="flex gap-2 items-center"
                >
                  <Copy size={16} />
                  Copy Address
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleOpenInMaps}
                  className="flex gap-2 items-center"
                >
                  <ExternalLink size={16} />
                  Open in Maps
                </DropdownMenuItem>

                {canUserEdit(trip.role) && (
                  <>
                    <DropdownMenuItem
                      onClick={() => setIsEditing(true)}
                      className="flex gap-2 items-center text-text-primary"
                    >
                      <Edit size={16} />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setIsModalOpen(true)}
                      className="flex gap-2 items-center text-error"
                    >
                      <Trash size={16} />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <EditableSelect
            selectedValue={eventData.category}
            canEdit={canUserEdit(trip.role)}
            defaultElement={
              <span className="flex items-center self-end gap-1  px-4 py-1 rounded-full bg-brand-secondary/10 text-brand-secondary text-xs font-semibold uppercase w-min ">
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

          <div className="flex items-center gap-2 text-text-secondary text-sm my-2">
            <MapPin size={14} className="shrink-0" />

            <p className="text-text-secondary text-xs truncate">
              {eventData.address}
            </p>
          </div>

          <EditableText
            value={eventData?.description ?? ""}
            canEdit={canUserEdit(trip.role)}
            textClassNames="text-xs"
            inputClassNames="text-xs"
            setValue={(description) => {
              updateEventData({ description });
            }}
            emptyText="Add notes"
          />

          <div className="mt-2 flex gap-4 justify-between text-xs text-text-secondary">
            <div className="flex items-center gap-2 ">
              <Clock size={16} className="text-brand-primary" />
              <div className="flex gap-1 text-sm ">
                {canUserEdit(trip.role) ? (
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
              open={isModalOpen}
              onOpenChange={setIsModalOpen}
              confirmAction={() => handleDelete(eventData.id)}
            />
          )}

          {isDateModalOpen && (
            <EditEventDatesModal
              event={event}
              tripStartDate={trip.startDate}
              tripEndDate={trip.endDate}
              open={isDateModalOpen}
              onOpenChange={setIsDateModalOpen}
              onSave={async (startAt, endAt) => {
                await updateEventData({ startAt, endAt });
              }}
            />
          )}
          {isEditing && (
            <EditEventModal
              event={event}
              open={isEditing}
              onOpenChange={setIsEditing}
              onSave={async (updatedEvent) => {
                await updateEventData(updatedEvent);
              }}
            />
          )}
        </div>
      </div>
    </StateGate>
  );
}
