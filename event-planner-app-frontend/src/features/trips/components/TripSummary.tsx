import { Calendar, MoreVertical, UserCog } from "lucide-react";
import type { Trip } from "../types";
import { formatDateRange } from "../../../utils/dateFormattors";
import { UserAvatarList } from "../../users/components";
import { useDispatch } from "react-redux";
import { openModal } from "../../modal/modalSlice";
import { ModalType } from "../../modal/types";
import { isAdmin } from "../../users/utils";
import useMenu from "../../../hooks/useMenu";

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
  const { name, description, startDate, endDate, userMemberships } = trip;
  const { openMenu, isMenuOpen, menuContainerRef, openButtonRef } = useMenu({
    closeOnClick: true,
  });

  const dispatch = useDispatch();

  function openUsersView() {
    dispatch(openModal({ type: ModalType.VIEW_USERS, props: null }));
  }

  const handleEdit = () => {
    dispatch(openModal({ type: ModalType.EDIT_TRIP, props: { trip } }));
  };

  const handleDelete = () => {
    dispatch(openModal({ type: ModalType.DELETE_TRIP, props: { trip } }));
  };

  const handleSettings = () => {
    openMenu();
  };

  return (
    <div className="relative flex flex-col gap-6">
      <div className="relative flex justify-between items-start">
        <div>
          {!hideTitle && <h2 className="title">{name}</h2>}
          <p className="text-text-secondary">{description}</p>
        </div>

        <button
          ref={openButtonRef}
          className="-mt-2 -mr-2 p-2 hover:bg-white/20"
          onClick={handleSettings}
        >
          <MoreVertical size={20} className="text-white" />
        </button>
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
      {isMenuOpen && (
        <div
          ref={menuContainerRef}
          className="absolute top-5 right-2 mt-2 w-32 bg-surface rounded-md shadow-lg z-10 flex flex-col text-sm"
        >
          {isAdmin(trip.role) && (
            <>
              <button onClick={handleEdit} className="btn-menu rounded-md">
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="btn-menu rounded-md text-error"
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
