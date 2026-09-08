import {
  Calendar,
  FileText,
  MoreVertical,
  Pencil,
  SquareArrowRightExit,
  Trash,
  UserCog,
} from "lucide-react";
import type { Trip } from "../types";
import { formatDateRange } from "../../../utils/dateFormattors";
import { UserAvatarList } from "../../users/components";
import { useSelector } from "react-redux";
import { isAdmin } from "../../users/utils";
import { useRemoveUserMutation } from "../../users/usersApiSlice";
import { isFetchBaseQueryError } from "../../api/utils";
import { toast } from "sonner";
import type { RootState } from "../../../store";
import { ConfirmModal } from "../../../components";
import { useState } from "react";
import { exportToCalendar, exportToDoc } from "../utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import DeleteTripModal from "../../modal/components/DeleteTripModal";
import EditTripModal from "../../modal/components/EditTripModal";
import ViewUsersModal from "../../modal/components/ViewUsersModal";
import { usePostHog } from "@posthog/react";

type ModalType = "edit" | "delete" | "users" | null;

interface TripSummaryProps {
  trip: Trip;
  showActions?: boolean;
  hideTitle?: boolean;
}
export default function TripSummary({
  trip,
  showActions,
  hideTitle,
}: TripSummaryProps) {
  const [modalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const { name, description, startDate, endDate, userMemberships } = trip;
  const [removeUser, { isLoading: isRemoveLoading }] = useRemoveUserMutation();
  const { userId } = useSelector((state: RootState) => state.auth);

  const posthog = usePostHog();

  function openUsersView() {
    setModalType("users");
  }

  const handleEdit = () => {
    setModalType("edit");
  };

  const handleDelete = () => {
    setModalType("delete");
  };

  const handleCloseModal = () => {
    setModalType(null);
  };

  const handleLeave = async () => {
    try {
      await removeUser({ tripId: trip.id, userId: userId! }).unwrap();
      posthog?.capture("user_left_trip", { trip_id: trip.id, role: trip.role });
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        toast.error((err.data as { message: string }).message);
      }
    }
  };

  return (
    <div className="relative flex flex-col gap-6">
      <div className="relative flex justify-between items-start">
        <div>
          {!hideTitle && <h2 className="title">{name}</h2>}
          <p className="text-text-secondary">{description}</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="-mt-2 -mr-4 p-2 btn bg">
            <MoreVertical size={20} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              disabled={isRemoveLoading}
              onClick={() => {
                exportToCalendar(trip.name, trip.events, trip.userMemberships);
                posthog?.capture("export_to_calendar", { trip_id: trip.id });
              }}
              className="flex gap-2 items-center"
            >
              <Calendar size={16} />
              Export to calendar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                exportToDoc(trip);
                posthog?.capture("export_to_doc", { trip_id: trip.id });
              }}
              className="flex gap-2 items-center"
            >
              <FileText size={16} />
              Export to Word
            </DropdownMenuItem>
            {isAdmin(trip.role) && (
              <>
                <DropdownMenuItem
                  onClick={handleEdit}
                  className="flex gap-2 items-center"
                >
                  <Pencil size={16} />
                  Edit
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem
              disabled={isRemoveLoading}
              onClick={() => setIsModalOpen(true)}
              className="flex gap-2 items-center text-error"
            >
              <SquareArrowRightExit size={16} />
              Leave
            </DropdownMenuItem>
            {isAdmin(trip.role) && (
              <DropdownMenuItem
                onClick={handleDelete}
                className="flex gap-2 items-center text-error"
              >
                <Trash size={16} />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex justify-between">
        <div className="flex gap-2 items-center">
          <Calendar size={20} /> {formatDateRange(startDate, endDate)}
        </div>
        <div className="flex gap-1">
          <UserAvatarList users={userMemberships} />
          {showActions && (
            <button
              className="p-2"
              aria-label="View Users"
              onClick={openUsersView}
            >
              <UserCog aria-hidden />
            </button>
          )}
        </div>
      </div>
      {modalOpen && (
        <ConfirmModal
          open={modalOpen}
          onOpenChange={setIsModalOpen}
          confirmAction={handleLeave}
          title={`Leave ${trip.name}?`}
          confirmText="Leave"
        />
      )}
      {modalType === "edit" && (
        <EditTripModal
          trip={trip}
          open={true}
          onOpenChange={handleCloseModal}
        />
      )}
      {modalType === "delete" && (
        <DeleteTripModal
          trip={trip}
          open={true}
          onOpenChange={handleCloseModal}
        />
      )}
      {modalType === "users" && (
        <ViewUsersModal open={true} onOpenChange={handleCloseModal} />
      )}
    </div>
  );
}
